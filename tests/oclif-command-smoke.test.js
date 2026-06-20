#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RUN = path.join(ROOT, 'bin', 'run');
const TEST_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-oclif-'));
const TEST_ENV = {
  ...process.env,
  APPDATA: path.join(TEST_HOME, 'appdata'),
  FORCE_COLOR: '0',
  HOME: TEST_HOME,
  LOCALAPPDATA: path.join(TEST_HOME, 'localappdata'),
  USERPROFILE: TEST_HOME,
  XDG_CACHE_HOME: path.join(TEST_HOME, '.cache'),
  XDG_CONFIG_HOME: path.join(TEST_HOME, '.config'),
  XDG_DATA_HOME: path.join(TEST_HOME, '.local', 'share')
};
const yaml = require('../src/js-yaml-compat');

process.on('exit', () => fs.rmSync(TEST_HOME, { force: true, recursive: true }));

assert.strictEqual(yaml.safeLoad, yaml.load);
assert.strictEqual(yaml.safeDump, yaml.dump);
assert.strictEqual(yaml.safeLoad('enabled: true').enabled, true);
assert.match(yaml.safeDump({ enabled: true }), /enabled: true/);

function runCli(args) {
  const result = spawnSync(process.execPath, [RUN, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: TEST_ENV
  });

  assert.strictEqual(result.error, undefined, result.error && result.error.message);
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  assert.strictEqual(result.stderr, '');
  return result.stdout.replace(/\r\n/g, '\n');
}

function rejectCli(args, sentinel) {
  const result = spawnSync(process.execPath, [RUN, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: TEST_ENV
  });

  assert.strictEqual(result.error, undefined, result.error && result.error.message);
  assert.strictEqual(result.status, 2, result.stderr || result.stdout);
  assert.strictEqual(result.stdout, '');
  assert.match(result.stderr, /This command does not accept arguments or flags\./);
  assert.ok(!result.stderr.includes(sentinel));
}

const help = runCli(['--help']);
assert.match(help, /Credential-free Twilio CLI plugin scaffold/);
assert.match(help, /gjones/);
assert.match(help, /Credential-free plugin scaffold commands/);

const commandOutput = runCli(['gjones:mycommand']);
assert.strictEqual(commandOutput, 'Hello World Test!\n');

const credentialSentinel = 'redaction-sentinel-value';
rejectCli(['gjones:mycommand', `--auth-token=${credentialSentinel}`], credentialSentinel);

const MyCommand = require(path.join(ROOT, 'src/commands/gjones/mycommand.js'));
assert.strictEqual(typeof MyCommand, 'function');
assert.strictEqual(typeof MyCommand.prototype.run, 'function');
assert.strictEqual(MyCommand.OUTPUT_MESSAGE, 'Hello World Test!');

console.log('oclif command smoke tests passed.');
