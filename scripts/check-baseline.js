#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  reportHostedWindowsPathFailures,
  validateHostedWindowsGitTree
} = require('./hosted-windows-path-policy');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED = [
  '.github/CODEOWNERS',
  '.github/trusted/verify-hosted-windows-path-policy.js',
  '.github/workflows/check.yml',
  '.github/workflows/trusted-hosted-windows-path-policy.yml',
  '.nvmrc',
  'CHANGES.md',
  'Makefile',
  'README.md',
  'SECURITY.md',
  'VISION.md',
  'bin/run',
  'bin/run.cmd',
  'docs/plans/2026-06-20-live-default-host-isolation.md',
  'package-lock.json',
  'package.json',
  'scripts/check-audit.js',
  'scripts/check-baseline.js',
  'scripts/check-consumer-audit.js',
  'scripts/check-real-twilio-host.js',
  'scripts/data/unicode-17-casefold-cf.json',
  'scripts/hosted-windows-path-policy.js',
  'scripts/unicode-casefold.js',
  'src/commands/gjones/mycommand.js',
  'tests/audit-policy.test.js',
  'tests/command-output.test.js',
  'tests/consumer-audit.test.js',
  'tests/helpers/packed-consumer.js',
  'tests/hosted-windows-path-policy.test.js',
  'tests/oclif-command-smoke.test.js',
  'tests/packed-consumer-security.test.js',
  'tests/trusted-hosted-windows-verifier.test.js',
  'tests/twilio-cli-host-compatibility.test.js',
  'tests/unicode-casefold-integrity.test.js',
  'tests/unsafe-yaml-payload.test.js',
  'vendor/unicode/17.0.0/CaseFolding.txt'
];
const PARENT_CONTROLLED_ENTRIES = {
  '.gitattributes': { mode: '100644', blob: '391f0a4e4b04a8b63e39431a8444e58f84214805' },
  '.github/workflows/check.yml': { mode: '100644', blob: 'a38665cd7aff23f1024aebad05ac3c049501cb17' },
  'bin/run': { mode: '100755', blob: 'fb2c4e1e1e05ef9c9a1decc90e85d64d074dafad' },
  'bin/run.cmd': { mode: '100644', blob: '968fc30758e686d7c4a569f87580ccd310d0b152' }
};

function read(relativePath) {
  return fs.readFileSync(`${ROOT}${path.sep}${relativePath}`, 'utf8').replace(/\r\n/g, '\n');
}

function currentTrackedEntry(relativePath) {
  const result = spawnSync('git', ['ls-files', '--stage', '--', relativePath], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });
  if (result.status !== 0) throw new Error(`git ls-files failed for ${relativePath}: ${result.stderr.trim()}`);
  const match = result.stdout.match(/^([0-7]{6}) ([0-9a-f]{40,64}) \d+\t/);
  if (!match) throw new Error(`git ls-files did not return a tracked entry for ${relativePath}`);
  return { mode: match[1], blob: match[2] };
}

function runHostedWindowsTreeCheck(treeish) {
  const failures = validateHostedWindowsGitTree({ repoRoot: ROOT, treeish });
  if (failures.length > 0) {
    reportHostedWindowsPathFailures(failures);
    process.exitCode = 1;
    return;
  }
  console.log(`Hosted Windows path policy passed for ${treeish}.`);
}

function main() {
  const treeCheckIndex = process.argv.indexOf('--check-git-tree');
  if (treeCheckIndex !== -1) {
    const treeish = process.argv[treeCheckIndex + 1];
    if (!treeish) throw new Error('--check-git-tree requires a tree object');
    runHostedWindowsTreeCheck(treeish);
    return;
  }

  const failures = [];
  for (const file of REQUIRED) {
    if (!fs.existsSync(`${ROOT}${path.sep}${file}`)) failures.push(`required file missing: ${file}`);
  }

  for (const phrase of [
    'ifneq ($(origin MAKEFILE_LIST),file)',
    '$(error MAKEFILE_LIST must not be overridden)',
    'override ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))'
  ]) {
    if (!read('Makefile').includes(phrase)) {
      failures.push(`Makefile must protect the repository root with ${phrase}`);
    }
  }

  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  if (pkg.description !== 'Credential-free Twilio CLI plugin scaffold') {
    failures.push('package description must retain the credential-free scaffold purpose');
  }
  if (pkg.dependencies !== undefined) failures.push('packed plugin must not own runtime dependencies');
  if (pkg.overrides !== undefined) failures.push('packed plugin must not publish dependency overrides');
  const expectedPeers = { '@oclif/core': '>=1.26.2 <5', '@twilio/cli-core': '>=8.3.2 <9' };
  const expectedPeerMeta = { '@oclif/core': { optional: true }, '@twilio/cli-core': { optional: true } };
  if (JSON.stringify(pkg.peerDependencies) !== JSON.stringify(expectedPeers)) {
    failures.push('package peers must describe the reviewed Oclif and Twilio host boundary');
  }
  if (JSON.stringify(pkg.peerDependenciesMeta) !== JSON.stringify(expectedPeerMeta)) {
    failures.push('host peer contracts must remain optional in standalone consumers');
  }
  const expectedDev = { '@oclif/core': '^4.11.7', 'js-yaml': '4.2.0', oclif: '^4.23.14' };
  if (JSON.stringify(pkg.devDependencies) !== JSON.stringify(expectedDev)) {
    failures.push('development dependencies must retain the audited Oclif 4 toolchain');
  }
  if (!Array.isArray(pkg.files) || pkg.files.includes('/bin') || !pkg.files.includes('/src')) {
    failures.push('packed files must include command source and exclude standalone launchers');
  }
  if (lock.lockfileVersion !== 3 || lock.packages?.['']?.dependencies !== undefined) {
    failures.push('lockfile root must have no runtime dependencies');
  }
  if (JSON.stringify(lock.packages?.['']?.peerDependencies) !== JSON.stringify(expectedPeers) ||
      JSON.stringify(lock.packages?.['']?.peerDependenciesMeta) !== JSON.stringify(expectedPeerMeta)) {
    failures.push('lockfile peer contracts must match package.json');
  }
  const yamlVersions = Object.entries(lock.packages || {})
    .filter(([name]) => name.endsWith('/js-yaml'))
    .map(([, value]) => value.version);
  if (yamlVersions.length === 0 || yamlVersions.some(version => version !== '4.2.0')) {
    failures.push(`development graph must resolve only js-yaml 4.2.0, received ${yamlVersions.join(', ')}`);
  }

  const expectedTest = 'npm run check && npm run test:unicode && npm run test:windows-paths && npm run test:trusted && npm run test:audit && npm run test:consumer && npm run test:packed && npm run test:yaml && npm run test:compatibility && npm run test:command && npm run test:oclif';
  if (pkg.scripts.test !== expectedTest) failures.push('npm test must run every local security and behavior regression');
  for (const [name, command] of Object.entries({
    check: 'node scripts/check-baseline.js',
    'test:unicode': 'node tests/unicode-casefold-integrity.test.js',
    'test:windows-paths': 'node tests/hosted-windows-path-policy.test.js',
    'test:trusted': 'node tests/trusted-hosted-windows-verifier.test.js',
    'test:audit': 'node tests/audit-policy.test.js',
    'test:consumer': 'node tests/consumer-audit.test.js',
    'test:packed': 'node tests/packed-consumer-security.test.js',
    'test:yaml': 'node tests/unsafe-yaml-payload.test.js',
    'test:compatibility': 'node tests/twilio-cli-host-compatibility.test.js',
    'test:command': 'node tests/command-output.test.js',
    'test:oclif': 'node tests/oclif-command-smoke.test.js',
    'audit:consumer': 'node scripts/check-consumer-audit.js',
    'verify:twilio-host': 'node scripts/check-real-twilio-host.js'
  })) {
    if (pkg.scripts[name] !== command) failures.push(`package.json must expose ${name}`);
  }

  const command = read('src/commands/gjones/mycommand.js');
  for (const phrase of [
    "module.parent.require('@oclif/core')",
    "const OUTPUT_MESSAGE = 'Hello World Test!'",
    'class MyCommand extends Command',
    'this.log(OUTPUT_MESSAGE)',
    'This command does not accept arguments or flags.'
  ]) {
    if (!command.includes(phrase)) failures.push(`command must include ${phrase}`);
  }
  for (const forbidden of ['js-yaml', 'safeLoad', 'safeDump', 'Module._load', 'TwilioClientCommand']) {
    if (command.includes(forbidden)) failures.push(`command must not include ${forbidden}`);
  }
  if (fs.existsSync(path.join(ROOT, 'src/js-yaml-compat.js'))) {
    failures.push('unsafe js-yaml compatibility preload must remain deleted');
  }

  const launcher = read('bin/run');
  for (const forbidden of ['js-yaml-compat', '@twilio/cli-core']) {
    if (launcher.includes(forbidden)) failures.push(`local launcher must not include ${forbidden}`);
  }
  if (!launcher.includes("require('@oclif/core')")) failures.push('local launcher must use the audited development Oclif');
  if (currentTrackedEntry('bin/run').mode !== '100755') {
    failures.push('local Unix launcher must remain executable');
  }
  if (!read('bin/run.cmd').includes('node "%~dp0\\run" %*')) failures.push('Windows launcher must delegate to bin/run');

  for (const file of REQUIRED.filter(file => file.endsWith('.js'))) {
    try {
      const source = read(file).replace(/^#![^\n]*\n/, '');
      // eslint-disable-next-line no-new-func
      new Function(source);
    } catch (error) {
      failures.push(`${file} must parse as JavaScript: ${error.message}`);
    }
  }

  const workflow = read('.github/workflows/check.yml');
  for (const phrase of [
    'permissions:\n  contents: read',
    'persist-credentials: false',
    'run: npm ci --ignore-scripts',
    'run: node scripts/check-audit.js',
    'run: npm test',
    'run: npm run audit:consumer',
    'run: npm run verify:twilio-host',
    'name: check',
    'needs: [matrix, consumer]'
  ]) {
    if (!workflow.includes(phrase)) failures.push(`workflow must include ${phrase}`);
  }
  for (const os of ['ubuntu-24.04', 'windows-2025']) {
    for (const node of [20, 22, 24, 25]) {
      if (!workflow.includes(`- os: ${os}\n            node: ${node}`)) {
        failures.push(`workflow must test ${os} on Node ${node}`);
      }
    }
  }
  if (/^\s+[\w-]+:\s+write\s*$/m.test(workflow)) failures.push('workflow must not grant write permissions');

  const trustedWorkflow = read('.github/workflows/trusted-hosted-windows-path-policy.yml');
  for (const phrase of [
    'pull_request_target:',
    'permissions:\n  contents: read\n  pull-requests: read',
    'persist-credentials: false',
    'ref: ${{ github.event.pull_request.base.sha }}',
    'git init --bare "$PR_GIT_DIR"',
    '"$HEAD_SHA:refs/trusted/head"',
    'node .github/trusted/verify-hosted-windows-path-policy.js "$PR_GIT_DIR" "$HEAD_SHA^{tree}"'
  ]) {
    if (!trustedWorkflow.includes(phrase)) failures.push(`trusted workflow must include ${phrase}`);
  }
  if (/^\s+[\w-]+:\s+write\s*$/m.test(trustedWorkflow)) failures.push('trusted workflow must not grant write permissions');
  if (/npm (ci|install|test|run)/.test(trustedWorkflow)) failures.push('trusted workflow must not install or run pull-request code');
  if (/ref: \$\{\{ github\.event\.pull_request\.head/.test(trustedWorkflow)) {
    failures.push('trusted workflow must not check out the pull request head');
  }

  const trustedVerifier = read('.github/trusted/verify-hosted-windows-path-policy.js');
  if (!trustedVerifier.includes("require('../../scripts/hosted-windows-path-policy')")) {
    failures.push('trusted verifier must use the same hosted Windows path policy module as the checker');
  }
  if (trustedVerifier.includes("require('../../tests/") || trustedVerifier.includes('child_process')) {
    failures.push('trusted verifier must stay independent from tests and process execution helpers');
  }

  const docs = ['README.md', 'SECURITY.md', 'CHANGES.md'].map(read).join('\n');
  for (const phrase of [
    'plugin-owned',
    'host-owned',
    'packed consumer',
    'zero',
    'js-yaml 3.14.2',
    'Twilio CLI 6.2.4',
    'Hello World Test!'
  ]) {
    if (!docs.includes(phrase)) failures.push(`documentation must distinguish the repair using ${phrase}`);
  }

  if (read('.nvmrc').trim() !== '24') failures.push('.nvmrc must retain Node 24 as the default baseline');
  if (read('.github/CODEOWNERS').trim() !== '* @garethpaul') failures.push('CODEOWNERS must retain @garethpaul');

  for (const [file, expected] of Object.entries(PARENT_CONTROLLED_ENTRIES)) {
    const actual = currentTrackedEntry(file);
    if (actual.blob !== expected.blob || actual.mode !== expected.mode) {
      failures.push(`${file} must retain parent blob ${expected.blob} and mode ${expected.mode}`);
    }
  }

  for (const failure of validateHostedWindowsGitTree({ repoRoot: ROOT, treeish: 'HEAD' })) {
    failures.push(`hosted Windows path policy: ${failure}`);
  }

  if (failures.length > 0) {
    console.error('plugin-gjones baseline check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log('plugin-gjones baseline checks passed.');
}

main();
