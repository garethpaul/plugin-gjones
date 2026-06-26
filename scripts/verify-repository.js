#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASELINE = 'scripts/check-baseline.js';
const TESTS = [
  'tests/unicode-casefold-integrity.test.js',
  'tests/hosted-windows-path-policy.test.js',
  'tests/trusted-hosted-windows-verifier.test.js',
  'tests/repository-verifier-authority.test.js',
  'tests/audit-policy.test.js',
  'tests/consumer-audit.test.js',
  'tests/packed-consumer-security.test.js',
  'tests/unsafe-yaml-payload.test.js',
  'tests/twilio-cli-host-compatibility.test.js',
  'tests/command-output.test.js',
  'tests/oclif-command-smoke.test.js'
];
const NODE_PRELOAD_OPTIONS = [
  '--experimental-loader',
  '--import',
  '--loader',
  '--require'
];

function assertSafeNodeBootstrap(execArguments = process.execArgv, environment = process.env) {
  if (environment.NODE_OPTIONS || environment.NODE_PATH) {
    throw new Error('Node preload options are not supported for repository verification');
  }

  for (const argument of execArguments) {
    const isCompactRequire = argument.startsWith('-r') && !argument.startsWith('--');
    const isPreloadOption = NODE_PRELOAD_OPTIONS.some(
      option => argument === option || argument.startsWith(`${option}=`)
    );
    if (isCompactRequire || isPreloadOption) {
      throw new Error('Node preload options are not supported for repository verification');
    }
  }
}

function verificationFiles(mode) {
  switch (mode) {
    case 'check':
    case 'lint':
    case 'build':
      return [BASELINE];
    case 'test':
      return [BASELINE, ...TESTS];
    case 'verify':
      return [BASELINE, BASELINE, ...TESTS, BASELINE];
    default:
      throw new Error(`unknown verification mode: ${mode}`);
  }
}

function childEnvironment() {
  const environment = { ...process.env };
  for (const name of [
    'NPM',
    'ROOT',
    'MAKEFLAGS',
    'MFLAGS',
    'MAKEFILES',
    'NODE_OPTIONS',
    'NODE_PATH'
  ]) delete environment[name];
  return environment;
}

function run(relativePath) {
  const result = spawnSync(process.execPath, [path.join(ROOT, relativePath)], {
    cwd: ROOT,
    encoding: 'utf8',
    env: childEnvironment(),
    maxBuffer: 32 * 1024 * 1024,
    shell: false,
    stdio: 'inherit'
  });

  if (result.error) throw result.error;
  return result.status === null ? 1 : result.status;
}

function main() {
  assertSafeNodeBootstrap();
  const mode = process.argv[2] || 'verify';
  if (process.argv.length > 3) {
    throw new Error(`unexpected repository verifier arguments: ${process.argv.slice(3).join(' ')}`);
  }

  for (const relativePath of verificationFiles(mode)) {
    const status = run(relativePath);
    if (status !== 0) process.exit(status);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
