#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github/workflows/trusted-hosted-windows-path-policy.yml');
const verifierPath = path.join(root, '.github/trusted/verify-hosted-windows-path-policy.js');

function readNormalized(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

const workflow = readNormalized(workflowPath);
const verifier = readNormalized(verifierPath);

assert.match(workflow, /^on:\n  pull_request_target:/m);
assert.match(workflow, /^permissions:\n  contents: read\n  pull-requests: read$/m);
assert.doesNotMatch(workflow, /^\s+[\w-]+:\s+write\s*$/m);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
assert.match(workflow, /git init --bare "\$PR_GIT_DIR"/);
assert.match(workflow, /git --git-dir="\$PR_GIT_DIR"[\s\S]+fetch --no-tags --filter=blob:none pr/);
assert.match(workflow, /"\$HEAD_SHA:refs\/trusted\/head"/);
assert.match(workflow, /node \.github\/trusted\/verify-hosted-windows-path-policy\.js "\$PR_GIT_DIR" "\$HEAD_SHA\^\{tree\}"/);
assert.doesNotMatch(workflow, /npm (ci|install|test|run)/);
assert.doesNotMatch(workflow, /ref: \$\{\{ github\.event\.pull_request\.head/);

assert.match(verifier, /require\('\.\.\/\.\.\/scripts\/hosted-windows-path-policy'\)/);
assert.match(verifier, /gitDir/);
assert.doesNotMatch(verifier, /require\('\.\.\/\.\.\/tests\//);
assert.doesNotMatch(verifier, /child_process/);

const candidateGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-trusted-verifier-'));

function git(args, input) {
  const result = spawnSync('git', [`--git-dir=${candidateGitDir}`, ...args], { input });
  assert.strictEqual(result.status, 0, result.stderr.toString() || result.stdout.toString());
  return result.stdout.toString().trim();
}

function writeBlob(content) {
  return git(['hash-object', '-w', '--stdin'], Buffer.from(content));
}

function writeForcedTree(entries) {
  const raw = [];
  for (const entry of entries) {
    raw.push(Buffer.from(`${entry.mode} ${entry.name}\0`), Buffer.from(entry.object, 'hex'));
  }
  return git(['hash-object', '--literally', '-t', 'tree', '-w', '--stdin'], Buffer.concat(raw));
}

function validBinEntry() {
  const launcher = writeBlob('#!/usr/bin/env node\n');
  const bin = writeForcedTree([{ mode: '100755', name: 'run', object: launcher }]);
  return { mode: '040000', name: 'bin', object: bin };
}

function verifyCandidate(tree) {
  return spawnSync(process.execPath, [verifierPath, candidateGitDir, tree], {
    cwd: root,
    encoding: 'utf8'
  });
}

function expectDuplicateRejected(name, tree, duplicatePath) {
  const result = verifyCandidate(tree);
  assert.strictEqual(
    result.status,
    1,
    `${name} must fail closed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  assert.match(result.stderr, new RegExp(`duplicate Git tree path "${duplicatePath}"`, 'i'));
}

git(['init', '--bare']);

try {
  const executableLauncher = verifyCandidate(writeForcedTree([validBinEntry()]));
  assert.strictEqual(
    executableLauncher.status,
    0,
    `trusted verifier must accept Git-tree mode 100755.\n${executableLauncher.stderr}`
  );

  const nonExecutableLauncher = writeBlob('#!/usr/bin/env node\n');
  const nonExecutableBin = writeForcedTree([
    { mode: '100644', name: 'run', object: nonExecutableLauncher }
  ]);
  const nonExecutableResult = verifyCandidate(writeForcedTree([
    { mode: '040000', name: 'bin', object: nonExecutableBin }
  ]));
  assert.strictEqual(
    nonExecutableResult.status,
    1,
    `trusted verifier must reject Git-tree mode 100644.\n${nonExecutableResult.stdout}`
  );
  assert.match(nonExecutableResult.stderr, /bin\/run.*100755/i);

  const firstLauncher = writeBlob('first launcher\n');
  const secondLauncher = writeBlob('second launcher\n');
  for (const entries of [
    [
      { mode: '100644', name: 'run', object: firstLauncher },
      { mode: '100755', name: 'run', object: secondLauncher }
    ],
    [
      { mode: '100755', name: 'run', object: secondLauncher },
      { mode: '100644', name: 'run', object: firstLauncher }
    ]
  ]) {
    const bin = writeForcedTree(entries);
    expectDuplicateRejected(
      'duplicate bin/run entries in either ordering',
      writeForcedTree([{ mode: '040000', name: 'bin', object: bin }]),
      'bin/run'
    );
  }

  const firstDocument = writeBlob('first document\n');
  const secondDocument = writeBlob('second document\n');
  for (const entries of [
    [
      { mode: '100644', name: 'README.md', object: firstDocument },
      { mode: '100644', name: 'README.md', object: secondDocument }
    ],
    [
      { mode: '100644', name: 'README.md', object: secondDocument },
      { mode: '100644', name: 'README.md', object: firstDocument }
    ]
  ]) {
    const docs = writeForcedTree(entries);
    expectDuplicateRejected(
      'duplicate paths outside bin in either ordering',
      writeForcedTree([validBinEntry(), { mode: '040000', name: 'docs', object: docs }]),
      'docs/README.md'
    );
  }

  const emptyDirectory = writeForcedTree([]);
  const conflictingFile = writeBlob('not a directory\n');
  for (const entries of [
    [
      { mode: '040000', name: 'docs', object: emptyDirectory },
      { mode: '100644', name: 'docs', object: conflictingFile }
    ],
    [
      { mode: '100644', name: 'docs', object: conflictingFile },
      { mode: '040000', name: 'docs', object: emptyDirectory }
    ]
  ]) {
    expectDuplicateRejected(
      'duplicate directory and file paths in either ordering',
      writeForcedTree([validBinEntry(), ...entries]),
      'docs'
    );
  }
} finally {
  fs.rmSync(candidateGitDir, { recursive: true, force: true });
}

console.log('trusted hosted Windows verifier tests passed.');
