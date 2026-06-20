#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const TWILIO_CLI_VERSION = process.env.TWILIO_CLI_VERSION || '6.2.4';

function runNpm(args, options = {}) {
  const result = spawnSync(NPM, args, {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
    ...options
  });
  if (result.error) throw result.error;
  return result;
}

function runTar(args, options = {}) {
  return spawnSync('tar', args, {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
    ...options
  });
}

function runTwilio(args, options = {}) {
  return spawnSync('twilio', args, {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
    ...options
  });
}

function requireSuccess(result, description) {
  if (result.status !== 0) {
    throw new Error(
      `${description} failed with status ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
}

function main() {
  if (process.platform === 'win32') {
    throw new Error('real Twilio CLI packed-host verification currently requires tar and a POSIX shell');
  }

  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-real-host-'));
  const hostRoot = path.join(temporaryRoot, 'host');
  const packRoot = path.join(temporaryRoot, 'pack');
  const extractRoot = path.join(temporaryRoot, 'plugin');
  const homeRoot = path.join(temporaryRoot, 'home');

  try {
    for (const directory of [hostRoot, packRoot, extractRoot, homeRoot]) fs.mkdirSync(directory);
    fs.writeFileSync(
      path.join(hostRoot, 'package.json'),
      `${JSON.stringify({ name: 'plugin-gjones-real-host', private: true, version: '1.0.0' }, null, 2)}\n`
    );

    requireSuccess(
      runNpm([
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--fund=false',
        `twilio-cli@${TWILIO_CLI_VERSION}`
      ], { cwd: hostRoot }),
      `Twilio CLI ${TWILIO_CLI_VERSION} install`
    );

    requireSuccess(
      runNpm(['pack', '--pack-destination', packRoot], { cwd: ROOT }),
      'plugin pack'
    );
    const artifacts = fs.readdirSync(packRoot).filter(file => file.endsWith('.tgz'));
    assert.strictEqual(artifacts.length, 1, 'expected exactly one packed plugin');
    const artifact = path.join(packRoot, artifacts[0]);
    requireSuccess(runTar(['-xzf', artifact, '-C', extractRoot]), 'plugin extraction');

    const pluginRoot = path.join(extractRoot, 'package');
    const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'package.json'), 'utf8'));
    assert.strictEqual(manifest.dependencies, undefined);
    assert.strictEqual(manifest.overrides, undefined);
    assert.ok(!fs.existsSync(path.join(pluginRoot, 'node_modules')));

    const hostBin = path.join(hostRoot, 'node_modules/.bin');
    const environment = {
      ...process.env,
      APPDATA: path.join(homeRoot, 'appdata'),
      FORCE_COLOR: '0',
      HOME: homeRoot,
      LOCALAPPDATA: path.join(homeRoot, 'localappdata'),
      PATH: `${hostBin}:${process.env.PATH || ''}`,
      USERPROFILE: homeRoot,
      XDG_CACHE_HOME: path.join(homeRoot, '.cache'),
      XDG_CONFIG_HOME: path.join(homeRoot, '.config'),
      XDG_DATA_HOME: path.join(homeRoot, '.local/share')
    };

    requireSuccess(runTwilio(['plugins:link', pluginRoot], { env: environment }), 'Twilio plugin link');
    const command = runTwilio(['gjones:mycommand'], { env: environment });
    requireSuccess(command, 'Twilio plugin command');
    assert.strictEqual(command.stdout.replace(/\r\n/g, '\n'), 'Hello World Test!\n');
    assert.strictEqual(command.stderr, '');
    assert.ok(!fs.existsSync(path.join(pluginRoot, 'node_modules')));

    const audit = runNpm(['audit', '--json'], { cwd: hostRoot });
    assert.ok([0, 1].includes(audit.status), `host npm audit exited ${audit.status}`);
    const auditReport = JSON.parse(audit.stdout);
    assert.strictEqual(
      auditReport.vulnerabilities?.['@garethpaul/plugin-gjones'],
      undefined,
      'host audit must not attribute advisories to the packed plugin'
    );

    const hostCounts = auditReport.metadata?.vulnerabilities;
    console.log(`real Twilio CLI ${TWILIO_CLI_VERSION} command passed on Node ${process.versions.node}.`);
    console.log(`host-owned advisory counts (not plugin findings): ${JSON.stringify(hostCounts)}`);
  } finally {
    fs.rmSync(temporaryRoot, { force: true, recursive: true });
  }
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}
