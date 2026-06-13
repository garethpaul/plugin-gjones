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
const COMMAND_DESCRIPTION_PLAN = 'docs/plans/2026-06-09-plugin-gjones-command-description.md';
const GATE_ALIASES_PLAN = 'docs/plans/2026-06-09-plugin-gjones-gate-aliases.md';
const PACKAGE_DESCRIPTION_PLAN = 'docs/plans/2026-06-09-plugin-gjones-package-description.md';
const WINDOWS_LAUNCHER_PLAN = 'docs/plans/2026-06-10-plugin-gjones-windows-launcher.md';
const NODE24_TOOLCHAIN_PLAN = 'docs/plans/2026-06-10-plugin-gjones-node24-toolchain.md';
const IMMUTABLE_OUTPUT_PLAN = 'docs/plans/2026-06-10-plugin-gjones-immutable-output-export.md';
const HOSTED_VALIDATION_PLAN = 'docs/plans/2026-06-10-hosted-node-validation.md';
const OCLIF_TOOLCHAIN_PLAN = 'docs/plans/2026-06-12-plugin-gjones-oclif-toolchain.md';
const TOPIC_DESCRIPTION_PLAN = 'docs/plans/2026-06-13-oclif-topic-description.md';
const REQUIRED = [
  '.github/CODEOWNERS',
  '.github/workflows/check.yml',
  '.gitignore',
  '.nvmrc',
  'CHANGES.md',
  'Makefile',
  'README.md',
  'SECURITY.md',
  'VISION.md',
  'bin/run',
  'bin/run.cmd',
  'docs/readme-overview.svg',
  'package.json',
  'package-lock.json',
  PLAN,
  CHECK_PLAN,
  COMMAND_EXECUTION_PLAN,
  OUTPUT_CONSTANT_PLAN,
  BIN_MODE_PLAN,
  PACKAGE_FILES_PLAN,
  OCLIF_METADATA_PLAN,
  COMMAND_DESCRIPTION_PLAN,
  GATE_ALIASES_PLAN,
  PACKAGE_DESCRIPTION_PLAN,
  WINDOWS_LAUNCHER_PLAN,
  NODE24_TOOLCHAIN_PLAN,
  IMMUTABLE_OUTPUT_PLAN,
  HOSTED_VALIDATION_PLAN,
  OCLIF_TOOLCHAIN_PLAN,
  TOPIC_DESCRIPTION_PLAN,
  'scripts/check-baseline.js',
  'src/commands/gjones/mycommand.js',
  'tests/command-output.test.js',
  'tests/oclif-command-smoke.test.js'
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function markdownSection(text, heading) {
  const lines = text.split('\n');
  const start = lines.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const followingHeading = lines.slice(start + 1).findIndex(line => line.startsWith('## '));
  const end = followingHeading === -1 ? lines.length : start + 1 + followingHeading;
  return lines.slice(start + 1, end).join('\n').trim();
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
  if (pkg.description !== 'Credential-free Twilio CLI plugin scaffold') {
    failures.push('package description must explain the credential-free scaffold purpose');
  }
  if (pkg.dependencies?.['@oclif/core'] !== '^1.26.2' || pkg.dependencies?.['@twilio/cli-core'] !== '^8.3.4') {
    failures.push('package.json must keep the reviewed oclif and Twilio CLI Core compatibility set');
  }
  if (JSON.stringify(pkg.devDependencies) !== JSON.stringify({ oclif: '^4.23.14' })) {
    failures.push('package.json must keep only the maintained oclif utility CLI as a direct development dependency');
  }
  for (const dependency of ['@oclif/command', '@oclif/config', '@oclif/dev-cli', '@oclif/test', '@twilio/cli-test', 'chai', 'eslint', 'eslint-config-oclif', 'globby', 'mocha', 'nyc']) {
    if (pkg.dependencies?.[dependency] || pkg.devDependencies?.[dependency]) {
      failures.push(`package.json must not restore unused legacy dependency ${dependency}`);
    }
  }
  const lock = JSON.parse(read('package-lock.json'));
  if (lock.lockfileVersion !== 3 || lock.packages?.['']?.dependencies?.['@oclif/core'] !== '^1.26.2' || lock.packages?.['']?.dependencies?.['@twilio/cli-core'] !== '^8.3.4' || lock.packages?.['']?.devDependencies?.oclif !== '^4.23.14') {
    failures.push('package-lock.json must preserve the reviewed lockfileVersion 3 dependency graph');
  }
  if (pkg.scripts.test !== 'npm run check && npm run test:command && npm run test:oclif') {
    failures.push('npm test must run the static baseline, command output test, and installed oclif smoke test');
  }
  if (pkg.scripts.lint !== 'npm run check') {
    failures.push('npm run lint must run the static baseline');
  }
  if (pkg.scripts.build !== 'npm run check') {
    failures.push('npm run build must run the static baseline');
  }
  if (pkg.scripts['test:command'] !== 'node tests/command-output.test.js') {
    failures.push('package.json must expose npm run test:command');
  }
  if (pkg.scripts['test:oclif'] !== 'node tests/oclif-command-smoke.test.js') {
    failures.push('package.json must expose npm run test:oclif');
  }
  if (pkg.scripts.postpack !== 'node -e "require(\'fs\').rmSync(\'oclif.manifest.json\', {force: true})"') {
    failures.push('package.json postpack cleanup must remain portable across hosted Linux and Windows');
  }
  if (pkg.scripts.prepack !== 'oclif manifest && oclif readme' || pkg.scripts.version !== 'oclif readme && git add README.md') {
    failures.push('package lifecycle scripts must use the maintained oclif utility CLI');
  }
  if (!pkg.engines || pkg.engines.node !== '>=24.0.0') {
    failures.push('package.json engines.node must require the Node 24 baseline');
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
  } else if (oclif.topics.gjones.description !== 'Credential-free plugin scaffold commands') {
    failures.push('package.json oclif.topics.gjones.description must match the credential-free scaffold purpose');
  }

  if (process.platform !== 'win32') {
    if (!isExecutable('bin/run')) {
      failures.push('bin/run must remain executable for Unix launcher installs');
    }
    if (isExecutable('bin/run.cmd')) {
      failures.push('bin/run.cmd should not be marked executable');
    }
  }
  const windowsLauncher = read('bin/run.cmd');
  if (!windowsLauncher.includes('@echo off')) {
    failures.push('bin/run.cmd must stay quiet before delegating to Node');
  }
  if (!windowsLauncher.includes('node "%~dp0\\run" %*')) {
    failures.push('bin/run.cmd must invoke the adjacent Unix launcher through Node');
  }

  for (const jsFile of [
    'scripts/check-baseline.js',
    'src/commands/gjones/mycommand.js',
    'tests/command-output.test.js',
    'tests/oclif-command-smoke.test.js'
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
    "const { Command } = require('@oclif/core')",
    "const OUTPUT_MESSAGE = 'Hello World Test!'",
    'class MyCommand extends Command',
    'this.log(OUTPUT_MESSAGE)',
    "Object.defineProperty(module.exports, 'OUTPUT_MESSAGE'",
    'enumerable: true',
    'Print a simple plugin scaffold message'
  ]) {
    if (!command.includes(phrase)) {
      failures.push(`mycommand.js must include ${phrase}`);
    }
  }
  if (command.includes("require('@oclif/command')") || command.includes("require('@oclif/config')")) {
    failures.push('mycommand.js must not restore archived oclif imports');
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
    "Object.getOwnPropertyDescriptor(CommandClass, 'OUTPUT_MESSAGE')",
    'outputDescriptor.writable, false',
    'outputDescriptor.configurable, false',
    "CommandClass.OUTPUT_MESSAGE = 'Changed output'",
    'CommandClass.description',
    'this.log(OUTPUT_MESSAGE);',
    "name === '@oclif/core'"
  ]) {
    if (!commandTest.includes(phrase)) {
      failures.push(`command output test must include ${phrase}`);
    }
  }

  const launcher = read('bin/run');
  for (const phrase of ["require('@oclif/core')", 'const { Errors, flush, run }', 'run()', '.then(flush)', '.catch(Errors.handle)']) {
    if (!launcher.includes(phrase)) {
      failures.push(`bin/run must include ${phrase}`);
    }
  }
  if (launcher.includes("require('@oclif/command')") || launcher.includes("require('@oclif/errors/handle')")) {
    failures.push('bin/run must not restore archived oclif launcher imports');
  }
  const oclifSmokeTest = read('tests/oclif-command-smoke.test.js');
  for (const phrase of ['spawnSync', "['--help']", "['gjones:mycommand']", "'Hello World Test!\\n'", '/Credential-free plugin scaffold commands/']) {
    if (!oclifSmokeTest.includes(phrase)) {
      failures.push(`oclif command smoke test must include ${phrase}`);
    }
  }
  if (fs.existsSync(path.join(ROOT, 'appveyor.yml'))) {
    failures.push('AppVeyor must stay retired in favor of the reviewed GitHub Actions matrix');
  }

  const gitignore = read('.gitignore');
  for (const phrase of ['node_modules', 'coverage', '.nyc_output', '.env', '*.log']) {
    if (!gitignore.includes(phrase)) {
      failures.push(`.gitignore must include ${phrase}`);
    }
  }
  if (gitignore.includes('package-lock.json')) {
    failures.push('.gitignore must not ignore the reviewed package-lock.json');
  }

  const nvmrc = read('.nvmrc').trim();
  if (nvmrc !== '24') {
    failures.push('.nvmrc must pin the Node 24 toolchain baseline');
  }

  const workflow = read('.github/workflows/check.yml');
  const actions = [...workflow.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)(?:\s+#.*)?$/gm)].map((match) => match[1]);
  for (const phrase of [
    'permissions:\n  contents: read',
    'cancel-in-progress: true',
    'os: [ubuntu-24.04, windows-2025]',
    'name: check (${{ matrix.os }})',
    'runs-on: ${{ matrix.os }}',
    'timeout-minutes: 10',
    'persist-credentials: false',
    'node-version-file: .nvmrc',
    'cache: npm',
    'run: npm ci --ignore-scripts',
    'run: npm audit --audit-level=low',
    'run: npm test',
    'run: npm pack --dry-run',
    'name: check',
    'needs: matrix',
    'MATRIX_RESULT: ${{ needs.matrix.result }}',
    'run: test "$MATRIX_RESULT" = success'
  ]) {
    if (!workflow.includes(phrase)) {
      failures.push(`GitHub Actions workflow must mention ${phrase}`);
    }
  }
  if (actions.join('\n') !== [
    'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
    'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e'
  ].join('\n')) {
    failures.push('GitHub Actions workflow must use only the pinned checkout and setup-node actions');
  }
  if (workflow.match(/persist-credentials:/g)?.length !== 1) {
    failures.push('GitHub Actions workflow must set checkout credential persistence exactly once');
  }
  if (/\bnpm install\b/.test(workflow) || (workflow.match(/npm ci --ignore-scripts/g) || []).length !== 1) {
    failures.push('GitHub Actions must install only from the lockfile with lifecycle scripts disabled');
  }
  const auditRuns = [...workflow.matchAll(/^\s*run:\s*(npm audit\S*.*)$/gm)].map(match => match[1].trim());
  if (JSON.stringify(auditRuns) !== JSON.stringify(['npm audit --audit-level=low']) || workflow.includes('npm audit --omit')) {
    failures.push('GitHub Actions must run exactly one full-graph npm audit at the low-severity threshold');
  }
  if ((workflow.match(/^\s{2}check:\s*$/gm) || []).length !== 1 || (workflow.match(/^\s{4}name:\s*check\s*$/gm) || []).length !== 1) {
    failures.push('GitHub Actions must expose one protected check context after the platform matrix');
  }
  if (workflow.match(/permissions:/g)?.length !== 1 || /^\s+[A-Za-z-]+:\s+write\s*$/m.test(workflow)) {
    failures.push('GitHub Actions workflow must keep one read-only permissions block');
  }
  const workflowFiles = fs.readdirSync(path.join(ROOT, '.github/workflows'));
  if (workflowFiles.length !== 1 || workflowFiles[0] !== 'check.yml') {
    failures.push('check.yml must be the repository\'s only hosted workflow');
  }
  if (read('.github/CODEOWNERS').trim() !== '* @garethpaul') {
    failures.push('CODEOWNERS must assign the repository to @garethpaul');
  }

  const docs = ['README.md', 'SECURITY.md', 'VISION.md', 'CHANGES.md']
    .map(read)
    .join('\n');
  for (const phrase of [
    'make check',
    'make lint',
    'make build',
    'npm run check',
    'npm run lint',
    'npm run build',
    'credential-free',
    'no account mutations',
    'Twilio credentials',
    'static baseline',
    'Hello World Test!',
    'test:command',
    'command execution test',
    'output constant',
    'immutable output export',
    'command description metadata',
    'package description',
    'credential-free Twilio CLI plugin scaffold',
    'executable launcher',
    'Windows launcher wrapper',
    'packaged launcher files',
    'oclif metadata',
    'Node 24',
    'GitHub Actions',
    'reviewed lockfile',
    'full dependency graph',
    'hosted Linux and Windows',
    '@oclif/core',
    'Twilio CLI Core 8.3.4',
    'test:oclif'
    ,'Credential-free plugin scaffold commands'
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

  const commandDescriptionPlan = read(COMMAND_DESCRIPTION_PLAN);
  for (const phrase of ['status: completed', 'CommandClass.description', 'npm run test:command']) {
    if (!commandDescriptionPlan.includes(phrase)) {
      failures.push(`command description plan must mention ${phrase}`);
    }
  }

  const gateAliasesPlan = read(GATE_ALIASES_PLAN);
  for (const phrase of ['status: completed', 'make lint', 'make build', 'npm run lint', 'npm run build']) {
    if (!gateAliasesPlan.includes(phrase)) {
      failures.push(`gate aliases plan must mention ${phrase}`);
    }
  }

  const packageDescriptionPlan = read(PACKAGE_DESCRIPTION_PLAN);
  for (const phrase of ['status: completed', 'package.json', 'credential-free Twilio CLI plugin scaffold', 'npm run check']) {
    if (!packageDescriptionPlan.includes(phrase)) {
      failures.push(`package description plan must mention ${phrase}`);
    }
  }

  const windowsLauncherPlan = read(WINDOWS_LAUNCHER_PLAN);
  for (const phrase of ['status: completed', 'bin/run.cmd', 'Windows launcher wrapper', 'npm run check']) {
    if (!windowsLauncherPlan.includes(phrase)) {
      failures.push(`windows launcher plan must mention ${phrase}`);
    }
  }

  const node24ToolchainPlan = read(NODE24_TOOLCHAIN_PLAN);
  for (const phrase of ['status: completed', 'Node 24', '.nvmrc', 'GitHub Actions', 'make check']) {
    if (!node24ToolchainPlan.includes(phrase)) {
      failures.push(`Node 24 toolchain plan must mention ${phrase}`);
    }
  }

  const immutableOutputPlan = read(IMMUTABLE_OUTPUT_PLAN);
  for (const phrase of ['status: completed', 'Object.defineProperty', 'non-writable', 'npm run test:command']) {
    if (!immutableOutputPlan.includes(phrase)) {
      failures.push(`immutable output plan must mention ${phrase}`);
    }
  }

  const hostedValidationPlan = read(HOSTED_VALIDATION_PLAN);
  for (const phrase of ['status: completed', 'Node 24', '.nvmrc', 'make check']) {
    if (!hostedValidationPlan.includes(phrase)) {
      failures.push(`hosted validation plan must mention ${phrase}`);
    }
  }

  const oclifToolchainPlan = read(OCLIF_TOOLCHAIN_PLAN);
  const oclifToolchainStatus = [...oclifToolchainPlan.matchAll(/^status:\s*(.+?)\s*$/gmi)].map(match => match[1]);
  const oclifToolchainWork = markdownSection(oclifToolchainPlan, 'Work Completed');
  const oclifToolchainVerification = markdownSection(oclifToolchainPlan, 'Verification Completed');
  if (oclifToolchainStatus.length !== 1 || oclifToolchainStatus[0] !== 'completed' || !oclifToolchainWork) {
    failures.push('oclif toolchain migration plan must record one completed status and completed work');
  }
  if (!oclifToolchainVerification || /\b(?:pending|todo|tbd|not run)\b/i.test(oclifToolchainVerification)) {
    failures.push('oclif toolchain migration plan must record finished verification without pending markers');
  }
  for (const evidence of [
    'Node 24.16.0',
    'npm ci --ignore-scripts',
    'npm audit --audit-level=low',
    'npm run check',
    'npm test',
    'make lint',
    'make test',
    'make build',
    'make verify',
    'make check',
    'external working directory',
    '462 installed packages',
    'expected six files',
    'tests/oclif-command-smoke.test.js',
    'Hello World Test!',
    'Eight hostile implementation mutations',
    'CRLF workflow simulation',
    '27413299838',
    '27413384712',
    '27413387196',
    '7a6faa081e4617ad96778440ca6a8e228253c954',
    'ea4ad6c0a5d93e765d4530b15f4f20ed1879167a',
    'ubuntu-24.04',
    'windows-2025'
  ]) {
    if (!oclifToolchainVerification.includes(evidence)) {
      failures.push(`oclif toolchain migration plan must preserve verification evidence: ${evidence}`);
    }
  }

  const topicDescriptionPlan = read(TOPIC_DESCRIPTION_PLAN);
  for (const phrase of ['status: completed', 'Node 24.16.0', 'npm test', 'hostile mutations rejected', 'command source and dependency paths had no diff', 'git diff --check', 'secret, generated-artifact, and dependency-drift scan']) {
    if (!topicDescriptionPlan.includes(phrase)) {
      failures.push(`topic description plan must mention ${phrase}`);
    }
  }

  const makefile = read('Makefile');
  if (!makefile.includes('check: verify')) {
    failures.push('Makefile must expose make check as the repository verification wrapper');
  }
  for (const phrase of ['lint:', 'build:', 'verify: lint test build']) {
    if (!makefile.includes(phrase)) {
      failures.push(`Makefile must include ${phrase}`);
    }
  }
  for (const phrase of [
    'ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))',
    'cd "$(ROOT)" && $(NPM) run lint',
    'cd "$(ROOT)" && $(NPM) test',
    'cd "$(ROOT)" && $(NPM) run build'
  ]) {
    if (!makefile.includes(phrase)) {
      failures.push(`Makefile must remain caller-directory independent with ${phrase}`);
    }
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
