#!/usr/bin/env node
'use strict';

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function git(args, options = {}) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    input: options.input,
    maxBuffer: 10 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

function writeBlob(content) {
  return git(['hash-object', '-w', '--stdin'], { input: content });
}

function tree(entries) {
  const input = entries
    .map(entry => `${entry.mode} ${entry.type} ${entry.hash}\t${entry.name}`)
    .join('\n') + '\n';
  return git(['mktree'], { input });
}

function insertPath(rootNode, filePath) {
  const segments = filePath.split('/');
  let node = rootNode;
  for (const segment of segments.slice(0, -1)) {
    node.children ||= new Map();
    if (!node.children.has(segment)) node.children.set(segment, {});
    node = node.children.get(segment);
  }
  node.children ||= new Map();
  node.children.set(segments[segments.length - 1], { content: `${filePath}\n` });
}

function treeForNode(node) {
  return tree([...node.children.entries()].map(([name, child]) => {
    if (child.children) {
      return { mode: '040000', type: 'tree', hash: treeForNode(child), name };
    }
    return { mode: '100644', type: 'blob', hash: writeBlob(child.content), name };
  }));
}

function gitTreeWithPaths(paths) {
  const rootNode = { children: new Map() };
  for (const filePath of paths) insertPath(rootNode, filePath);
  return treeForNode(rootNode);
}

function checkGitTree(paths) {
  const treeHash = gitTreeWithPaths(paths);
  return spawnSync(process.execPath, ['scripts/check-baseline.js', '--check-git-tree', treeHash], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
}

function expectUnsafeTree(name, paths, patterns) {
  const result = checkGitTree(paths);
  assert.strictEqual(
    result.status,
    1,
    `${name} must fail closed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  for (const pattern of patterns) assert.match(result.stderr, pattern);
}

function expectSafeTree(name, paths) {
  const result = checkGitTree(paths);
  assert.strictEqual(
    result.status,
    0,
    `${name} must remain allowed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
}

for (const reservedPath of [
  'docs/COM¹.txt',
  'docs/com².md',
  'docs/CoM³.log',
  'docs/LPT¹.txt',
  'docs/lpt².md',
  'docs/LpT³.log'
]) {
  expectUnsafeTree(
    `Windows superscript reserved device alias ${reservedPath}`,
    [reservedPath],
    [new RegExp(reservedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), /reserved/i]
  );
}

expectSafeTree('ordinary superscript names', [
  'docs/report¹.txt',
  'docs/COM⁴.txt',
  'docs/LPT⁰.md',
  'docs/XCOM¹.txt',
  'docs/COM¹suffix.txt'
]);

expectUnsafeTree(
  'Beria Erfe Unicode 17 case-fold collision',
  ['docs/𖺠.md', 'docs/𖺻.md'],
  [/docs\/𖺠\.md/, /docs\/𖺻\.md/, /case-fold/i]
);
expectUnsafeTree(
  'multi-code-point sharp S case-fold collision',
  ['docs/Fuß.md', 'docs/fuss.md'],
  [/docs\/Fuß\.md/, /docs\/fuss\.md/, /case-fold/i]
);
expectUnsafeTree(
  'sigma and final sigma case-fold collision',
  ['docs/Σ.md', 'docs/ς.md'],
  [/docs\/Σ\.md/, /docs\/ς\.md/, /case-fold/i]
);
expectUnsafeTree(
  'canonical combining mark collision after case folding',
  ['docs/Cafe\u0301.md', 'docs/Café.md'],
  [/docs\/Café\.md/, /docs\/Café\.md/, /case-fold/i]
);
expectUnsafeTree(
  'tree-wide directory case-fold collision',
  ['DOCS/readme.md', 'docs/readme.md'],
  [/DOCS/, /docs/, /case-fold/i]
);
expectUnsafeTree(
  'Windows reserved device name',
  ['docs/AUX.md'],
  [/docs\/AUX\.md/, /reserved/i]
);
expectUnsafeTree(
  'Windows trailing dot and space names',
  ['docs/trailing-dot.', 'docs/trailing-space '],
  [/trailing-dot\./, /trailing-space /, /trailing/i]
);
expectUnsafeTree(
  'Windows alternate data stream syntax',
  ['docs/readme.md:Zone.Identifier'],
  [/docs\/readme\.md:Zone\.Identifier/, /alternate data stream/i]
);

console.log('hosted Windows path policy tests passed.');
