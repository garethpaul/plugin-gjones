#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLAN = 'docs/plans/2026-06-08-plugin-gjones-baseline.md';
const REQUIRED = [
  '.gitignore',
  'CHANGES.md',
  'README.md',
  'SECURITY.md',
  'VISION.md',
  'appveyor.yml',
  'bin/run',
  'bin/run.cmd',
  'docs/readme-overview.svg',
  'package.json',
  PLAN,
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
    'class MyCommand extends Command',
    "this.log('Hello World Test!')",
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
    'npm run check',
    'credential-free',
    'no account mutations',
    'Twilio credentials',
    'static baseline',
    'Hello World Test!',
    'test:command'
  ]) {
    if (!docs.toLowerCase().includes(phrase.toLowerCase())) {
      failures.push(`docs must mention ${phrase}`);
    }
  }

  const plan = read(PLAN);
  if (!plan.includes('status: completed') || !plan.includes('npm run check') || !plan.includes('npm run test:command')) {
    failures.push('plan must record completed status and command verification');
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
