#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const verifier = path.join(root, 'scripts', 'verify-repository.js');
const makefile = path.join(root, 'Makefile');
const externalCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-verifier-authority-'));
const baselineMarker = 'plugin-gjones baseline checks passed.';
const makeFailure = 'Make is not a trusted validation entrypoint';
const successToken = 'PLUGIN_GJONES_VERIFICATION_OK';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || externalCwd,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
    maxBuffer: 32 * 1024 * 1024,
    shell: false
  });
}

function writeFile(file, contents, options = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, options);
}

function outputOf(result) {
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function markerContents(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function expectBaselineRan(name, result, forbiddenMarkers = []) {
  assert.strictEqual(result.error, undefined, `${name}: ${result.error && result.error.message}`);
  assert.strictEqual(
    result.status,
    0,
    `${name} must succeed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  assert.match(
    outputOf(result),
    new RegExp(baselineMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `${name} must execute the repository-owned verifier.`
  );
  for (const marker of forbiddenMarkers) {
    assert.strictEqual(markerContents(marker), '', `${name} must not execute ${marker}`);
  }
}

function expectVerifierRejected(name, result) {
  assert.strictEqual(result.error, undefined, `${name}: ${result.error && result.error.message}`);
  assert.notStrictEqual(result.status, 0, `${name} must fail closed.`);
  assert.doesNotMatch(result.stdout || '', new RegExp(successToken), `${name} must not emit a success token.`);
}

function expectMakeRejected(name, result, forbiddenMarkers = []) {
  assert.strictEqual(result.error, undefined, `${name}: ${result.error && result.error.message}`);
  assert.notStrictEqual(result.status, 0, `${name} must fail closed.`);
  assert.match(outputOf(result), new RegExp(makeFailure), `${name} must reject Make as an entrypoint.`);
  assert.doesNotMatch(outputOf(result), new RegExp(successToken), `${name} must not emit a success token.`);
  assert.doesNotMatch(outputOf(result), new RegExp(baselineMarker), `${name} must not claim validation.`);
  for (const marker of forbiddenMarkers) {
    assert.strictEqual(markerContents(marker), '', `${name} must not execute ${marker}`);
  }
}

function writeFakeShell(name) {
  const fakeShell = path.join(externalCwd, process.platform === 'win32' ? `${name}.cmd` : name);
  const fakeLog = path.join(externalCwd, `${name}.log`);
  if (process.platform === 'win32') {
    writeFile(fakeShell, [
      '@echo off',
      `>>"%FAKE_SHELL_LOG%" echo FAKE_SHELL_RAN:%*`,
      `<nul set /p=${successToken}`,
      'exit /b 0',
      ''
    ].join('\r\n'));
  } else {
    writeFile(fakeShell, [
      '#!/bin/sh',
      'printf \'%s\\n\' "FAKE_SHELL_RAN:$*" >> "$FAKE_SHELL_LOG"',
      `printf '%s' '${successToken}'`,
      'exit 0',
      ''
    ].join('\n'), { mode: 0o700 });
  }
  return { fakeLog, fakeShell };
}

function writeFakeNode(name) {
  const fakeDirectory = path.join(externalCwd, name);
  const fakeNode = path.join(fakeDirectory, process.platform === 'win32' ? 'node.cmd' : 'node');
  const fakeLog = path.join(externalCwd, `${name}.log`);
  if (process.platform === 'win32') {
    writeFile(fakeNode, [
      '@echo off',
      `>>"%FAKE_NODE_LOG%" echo FAKE_NODE_RAN:%*`,
      `<nul set /p=${successToken}`,
      'exit /b 0',
      ''
    ].join('\r\n'));
  } else {
    writeFile(fakeNode, [
      '#!/bin/sh',
      'printf \'%s\\n\' "FAKE_NODE_RAN:$*" >> "$FAKE_NODE_LOG"',
      `printf '%s' '${successToken}'`,
      'exit 0',
      ''
    ].join('\n'), { mode: 0o700 });
  }
  return { fakeDirectory, fakeLog };
}

try {
  const fakeNode = writeFakeNode('fake-node');
  expectBaselineRan(
    'direct verifier from an external cwd with hostile metadata and PATH',
    run(process.execPath, [verifier, 'lint'], {
      env: {
        FAKE_NODE_LOG: fakeNode.fakeLog,
        NPM: 'true',
        PATH: `${fakeNode.fakeDirectory}${path.delimiter}${process.env.PATH || ''}`,
        ROOT: path.join(externalCwd, 'attacker-root')
      }
    }),
    [fakeNode.fakeLog]
  );

  const makeAvailable = run('make', ['--version']).status === 0;
  if (makeAvailable) {
    const attackerMarker = path.join(externalCwd, 'attacker-recipe.log');
    const fakeShell = writeFakeShell('fake-shell');
    const shellPrelude = path.join(externalCwd, 'fake-shell-prelude.mk');
    writeFile(shellPrelude, `SHELL := ${fakeShell.fakeShell}\n`);

    const laterFiles = {
      npm: path.join(externalCwd, 'later-npm.mk'),
      root: path.join(externalCwd, 'later-root.mk'),
      recipe: path.join(externalCwd, 'replace-recipe.mk')
    };
    writeFile(laterFiles.npm, 'override NPM := true\n');
    writeFile(laterFiles.root, `override ROOT := ${path.join(externalCwd, 'attacker-root')}\n`);
    writeFile(laterFiles.recipe, [
      '.PHONY: lint',
      'lint:',
      `\t@${JSON.stringify(process.execPath)} -e "require('fs').writeFileSync(process.env.ATTACKER_MARKER, 'ran')"`,
      ''
    ].join('\n'));

    const shellFlags = `-c printf '${successToken}'; exit 0 #`;
    const makeAttacks = [
      {
        name: 'plain make lint',
        args: ['-f', makefile, 'lint']
      },
      {
        name: 'later override NPM',
        args: ['-f', makefile, '-f', laterFiles.npm, 'lint']
      },
      {
        name: 'later override ROOT',
        args: ['-f', makefile, '-f', laterFiles.root, 'lint']
      },
      {
        name: 'later -f recipe replacement',
        args: ['-f', makefile, '-f', laterFiles.recipe, 'lint'],
        env: { ATTACKER_MARKER: attackerMarker },
        markers: [attackerMarker]
      },
      {
        name: 'command-line SHELL fake shell',
        args: ['-f', makefile, `SHELL=${fakeShell.fakeShell}`, 'lint'],
        env: { FAKE_SHELL_LOG: fakeShell.fakeLog },
        markers: [fakeShell.fakeLog]
      },
      {
        name: 'MAKEFLAGS SHELL fake shell',
        args: ['-f', makefile, 'lint'],
        env: { FAKE_SHELL_LOG: fakeShell.fakeLog, MAKEFLAGS: `SHELL=${fakeShell.fakeShell}` },
        markers: [fakeShell.fakeLog]
      },
      {
        name: 'MAKEFILES fake shell',
        args: ['-f', makefile, 'lint'],
        env: { FAKE_SHELL_LOG: fakeShell.fakeLog, MAKEFILES: shellPrelude },
        markers: [fakeShell.fakeLog]
      },
      {
        name: 'earlier -f fake shell',
        args: ['-f', shellPrelude, '-f', makefile, 'lint'],
        env: { FAKE_SHELL_LOG: fakeShell.fakeLog },
        markers: [fakeShell.fakeLog]
      },
      {
        name: 'PATH fake node',
        args: ['-f', makefile, 'lint'],
        env: {
          FAKE_NODE_LOG: fakeNode.fakeLog,
          PATH: `${fakeNode.fakeDirectory}${path.delimiter}${process.env.PATH || ''}`
        },
        markers: [fakeNode.fakeLog]
      },
      {
        name: 'command-line .SHELLFLAGS success token',
        args: ['-f', makefile, `.SHELLFLAGS=${shellFlags}`, 'lint']
      },
      {
        name: 'environment .SHELLFLAGS success token',
        args: ['-f', makefile, 'lint'],
        env: { '.SHELLFLAGS': shellFlags }
      }
    ];

    for (const attack of makeAttacks) {
      for (const marker of attack.markers || []) fs.rmSync(marker, { force: true });
      expectMakeRejected(
        attack.name,
        run('make', attack.args, { env: attack.env || {} }),
        attack.markers || []
      );
    }

    const brokenRoot = path.join(externalCwd, 'broken-repository');
    fs.cpSync(root, brokenRoot, {
      recursive: true,
      filter(source) {
        return !['.git', '.evidence', 'node_modules'].includes(path.basename(source));
      }
    });
    assert.strictEqual(run('git', ['init', '-q', brokenRoot]).status, 0);
    assert.strictEqual(run('git', ['-C', brokenRoot, 'add', '-A']).status, 0);
    const brokenPackagePath = path.join(brokenRoot, 'package.json');
    const brokenPackage = JSON.parse(fs.readFileSync(brokenPackagePath, 'utf8'));
    brokenPackage.description = 'hostile replacement';
    fs.writeFileSync(brokenPackagePath, `${JSON.stringify(brokenPackage, null, 2)}\n`);

    expectVerifierRejected(
      'direct verifier broken-tree negative control',
      run(process.execPath, [path.join(brokenRoot, 'scripts', 'verify-repository.js'), 'lint'])
    );

    for (const attack of makeAttacks) {
      const brokenArgs = attack.args.map(argument => argument === makefile ? path.join(brokenRoot, 'Makefile') : argument);
      for (const marker of attack.markers || []) fs.rmSync(marker, { force: true });
      expectMakeRejected(
        `${attack.name} broken-tree negative control`,
        run('make', brokenArgs, { env: attack.env || {} }),
        attack.markers || []
      );
    }
  }
} finally {
  fs.rmSync(externalCwd, { recursive: true, force: true });
}

console.log('repository verifier authority tests passed.');
