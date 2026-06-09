#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLAN = 'docs/plans/2026-06-08-plugin-gjones-baseline.md';
const CHECK_PLAN = 'docs/plans/2026-06-08-plugin-gjones-check-wrapper.md';
const COMMAND_EXECUTION_PLAN = 'docs/plans/2026-06-09-plugin-gjones-command-execution-test.md';
const OUTPUT_CONSTANT_PLAN = 'docs/plans/2026-06-09-plugin-gjones-output-constant.md';
const BIN_MODE_PLAN = 'docs/plans/2026-06-09-plugin-gjones-bin-run-mode.md';
const PACKAGE_FILES_PLAN = 'docs/plans/2026-06-09-plugin-gjones-package-files.md';
const OCLIF_METADATA_PLAN = 'docs/plans/2026-06-09-plugin-gjones-oclif-metadata.md';
const REQUIRED = [
  '.gitignore',
  'CHANGES.md',
  'Makefile',
  'README.md',
  'SECURITY.md',
  'VISION.md',
  'appveyor.yml',
  'bin/run',
  'bin/run.cmd',
  'docs/readme-overview.svg',
  'package.json',
  PLAN,
  CHECK_PLAN,
  COMMAND_EXECUTION_PLAN,
  OUTPUT_CONSTANT_PLAN,
  BIN_MODE_PLAN,
  PACKAGE_FILES_PLAN,
  OCLIF_METADATA_PLAN,
  'scripts/check-baseline.js',
  'src/commands/gjones/mycommand.js',
  'tests/command-output.test.js'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function parseSource(relativePath) {
  return read(relativePath).replace(/^#![^\n]*\n/, '');
}

function isExecutable(relativePath) {
  return Boolean(fs.statSync(path.join(ROOT, relativePath)).mode & 0o111);
}

function main() {
  const failures = [];
  for (const file of REQUIRED) {
    if (!fs.existsSync(path.join(ROOT, file))) {
      failures.push(`required file missing: ${file}`);
    }
  }

  const pkg = JSON.parse(read('package.json'));
  if (pkg.scripts.check !== 'node scripts/check-baseline.js') {
    failures.push('package.json must expose npm run check');
  }
  if (pkg.scripts.test !== 'npm run check && npm run test:command') {
    failures.push('npm test must run the static baseline and command output test');
  }
  if (pkg.scripts['test:command'] !== 'node tests/command-output.test.js') {
    failures.push('package.json must expose npm run test:command');
  }
  if (pkg.scripts.posttest) {
    failures.push('posttest should not run npm audit without a committed lockfile');
  }
  if (pkg.bugs !== 'https://github.com/garethpaul/plugin-gjones/issues') {
    failures.push('package bugs URL must point at this repository');
  }
  if (!Array.isArray(pkg.files) || !pkg.files.includes('/bin')) {
    failures.push('package.json files must include /bin so launchers are published');
  }
  const oclif = pkg.oclif || {};
  if (oclif.name !== 'gjones') {
    failures.push('package.json oclif.name must remain gjones');
  }
  if (oclif.bin !== 'twilio') {
    failures.push('package.json oclif.bin must remain twilio');
  }
  if (oclif.commands !== './src/commands') {
    failures.push('package.json oclif.commands must remain ./src/commands');
  }
  if (typeof oclif.repositoryPrefix !== 'string' || !oclif.repositoryPrefix.includes('<%- commandPath %>')) {
    failures.push('package.json oclif.repositoryPrefix must link command source paths');
  }
  if (!oclif.topics || !oclif.topics.gjones) {
    failures.push('package.json oclif.topics must include gjones');
  } else if (typeof oclif.topics.gjones.description !== 'string' || !oclif.topics.gjones.description.trim()) {
    failures.push('package.json oclif.topics.gjones.description must stay populated');
  }

  if (!isExecutable('bin/run')) {
    failures.push('bin/run must remain executable for Unix launcher installs');
  }
  if (isExecutable('bin/run.cmd')) {
    failures.push('bin/run.cmd should not be marked executable');
  }

  for (const jsFile of [
    'scripts/check-baseline.js',
    'src/commands/gjones/mycommand.js',
    'tests/command-output.test.js'
  ]) {
    try {
      // eslint-disable-next-line no-new-func
      new Function(parseSource(jsFile));
    } catch (error) {
      failures.push(`${jsFile} must parse as JavaScript: ${error.message}`);
    }
  }

  const command = read('src/commands/gjones/mycommand.js');
  for (const phrase of [
    "const { Command } = require('@oclif/command')",
    "const OUTPUT_MESSAGE = 'Hello World Test!'",
    'class MyCommand extends Command',
    'this.log(OUTPUT_MESSAGE)',
    'Print a simple plugin scaffold message'
  ]) {
    if (!command.includes(phrase)) {
      failures.push(`mycommand.js must include ${phrase}`);
    }
  }
  for (const forbidden of ['Twilio' + 'ClientCommand', 'Twilio' + 'CliError']) {
    if (command.includes(forbidden)) {
      failures.push(`mycommand.js must not require Twilio credentials: ${forbidden}`);
    }
  }

  const commandTest = read('tests/command-output.test.js');
  for (const phrase of [
    'vm.runInNewContext',
    'await command.run()',
    "assert.deepStrictEqual(lines, [EXPECTED_OUTPUT])",
    'CommandClass.OUTPUT_MESSAGE',
    'this.log(OUTPUT_MESSAGE);',
    "name === '@oclif/command'"
  ]) {
    if (!commandTest.includes(phrase)) {
      failures.push(`command output test must include ${phrase}`);
    }
  }

  const appveyor = read('appveyor.yml');
  if (!appveyor.includes('nodejs_version: "10"')) {
    failures.push('appveyor.yml must use the package-supported Node 10 baseline');
  }
  const forbiddenCi = ['Invoke-' + 'WebRequest', 'codecov' + '.io', 'bash ' + 'codecov.sh'];
  for (const forbidden of forbiddenCi) {
    if (appveyor.includes(forbidden)) {
      failures.push(`appveyor.yml must not download and execute remote CI scripts: ${forbidden}`);
    }
  }

  const gitignore = read('.gitignore');
  for (const phrase of ['node_modules', 'coverage', '.nyc_output', '.env', '*.log']) {
    if (!gitignore.includes(phrase)) {
      failures.push(`.gitignore must include ${phrase}`);
    }
  }

  const docs = ['README.md', 'SECURITY.md', 'VISION.md', 'CHANGES.md']
    .map(read)
    .join('\n');
  for (const phrase of [
    'make check',
    'npm run check',
    'credential-free',
    'no account mutations',
    'Twilio credentials',
    'static baseline',
    'Hello World Test!',
    'test:command',
    'command execution test',
    'output constant',
    'executable launcher',
    'packaged launcher files',
    'oclif metadata'
  ]) {
    if (!docs.toLowerCase().includes(phrase.toLowerCase())) {
      failures.push(`docs must mention ${phrase}`);
    }
  }

  const plan = read(PLAN);
  if (!plan.includes('status: completed') || !plan.includes('npm run check') || !plan.includes('npm run test:command')) {
    failures.push('plan must record completed status and command verification');
  }

  const checkPlan = read(CHECK_PLAN);
  for (const phrase of ['status: completed', 'make check', 'npm test']) {
    if (!checkPlan.includes(phrase)) {
      failures.push(`check wrapper plan must mention ${phrase}`);
    }
  }

  const commandExecutionPlan = read(COMMAND_EXECUTION_PLAN);
  for (const phrase of ['status: completed', 'vm.runInNewContext', 'npm run test:command']) {
    if (!commandExecutionPlan.includes(phrase)) {
      failures.push(`command execution plan must mention ${phrase}`);
    }
  }

  const outputConstantPlan = read(OUTPUT_CONSTANT_PLAN);
  for (const phrase of ['status: completed', 'OUTPUT_MESSAGE', 'npm run test:command']) {
    if (!outputConstantPlan.includes(phrase)) {
      failures.push(`output constant plan must mention ${phrase}`);
    }
  }

  const binModePlan = read(BIN_MODE_PLAN);
  for (const phrase of ['status: completed', 'bin/run', 'executable', 'npm run check']) {
    if (!binModePlan.includes(phrase)) {
      failures.push(`bin mode plan must mention ${phrase}`);
    }
  }

  const packageFilesPlan = read(PACKAGE_FILES_PLAN);
  for (const phrase of ['status: completed', '/bin', 'package.json', 'npm run check']) {
    if (!packageFilesPlan.includes(phrase)) {
      failures.push(`package files plan must mention ${phrase}`);
    }
  }

  const oclifMetadataPlan = read(OCLIF_METADATA_PLAN);
  for (const phrase of ['status: completed', 'oclif metadata', 'package.json', 'npm run check']) {
    if (!oclifMetadataPlan.includes(phrase)) {
      failures.push(`oclif metadata plan must mention ${phrase}`);
    }
  }

  const makefile = read('Makefile');
  if (!makefile.includes('check: verify')) {
    failures.push('Makefile must expose make check as the repository verification wrapper');
  }

  const svg = read('docs/readme-overview.svg');
  if (!svg.includes('<svg') || !svg.includes('</svg>')) {
    failures.push('docs/readme-overview.svg must remain an SVG');
  }

  if (failures.length) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exitCode = 1;
    return;
  }

  console.log('plugin-gjones baseline checks passed.');
}

main();
