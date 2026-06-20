#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED = [
  '.github/CODEOWNERS',
  '.github/workflows/check.yml',
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
  'src/commands/gjones/mycommand.js',
  'tests/audit-policy.test.js',
  'tests/command-output.test.js',
  'tests/consumer-audit.test.js',
  'tests/helpers/packed-consumer.js',
  'tests/oclif-command-smoke.test.js',
  'tests/packed-consumer-security.test.js',
  'tests/twilio-cli-host-compatibility.test.js',
  'tests/unsafe-yaml-payload.test.js'
];

function read(relativePath) {
  return fs.readFileSync(`${ROOT}${path.sep}${relativePath}`, 'utf8').replace(/\r\n/g, '\n');
}

function isExecutable(relativePath) {
  return Boolean(fs.statSync(`${ROOT}${path.sep}${relativePath}`).mode & 0o111);
}

function main() {
  const failures = [];
  for (const file of REQUIRED) {
    if (!fs.existsSync(`${ROOT}${path.sep}${file}`)) failures.push(`required file missing: ${file}`);
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

  const expectedTest = 'npm run check && npm run test:audit && npm run test:consumer && npm run test:packed && npm run test:yaml && npm run test:compatibility && npm run test:command && npm run test:oclif';
  if (pkg.scripts.test !== expectedTest) failures.push('npm test must run every local security and behavior regression');
  for (const [name, command] of Object.entries({
    check: 'node scripts/check-baseline.js',
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
  if (!isExecutable('bin/run')) failures.push('local Unix launcher must remain executable');
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

  if (failures.length > 0) {
    console.error('plugin-gjones baseline check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log('plugin-gjones baseline checks passed.');
}

main();
