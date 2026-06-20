'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function npmSpawnOptions(platform = process.platform) {
  return { shell: platform === 'win32' };
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
    ...npmSpawnOptions(),
    ...options
  });

  if (result.error) throw result.error;
  return result;
}

function requireSuccess(result, description) {
  if (result.status !== 0) {
    throw new Error(
      `${description} failed with status ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }
}

function packRepository() {
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-pack-'));
  const result = run(NPM, [
    'pack',
    '--ignore-scripts',
    '--json',
    '--pack-destination',
    destination
  ], { cwd: ROOT });
  requireSuccess(result, 'npm pack');

  const report = JSON.parse(result.stdout);
  if (!Array.isArray(report) || report.length !== 1 || !report[0].filename) {
    throw new Error(`npm pack returned an unexpected report: ${result.stdout}`);
  }

  return {
    cleanup() {
      fs.rmSync(destination, { force: true, recursive: true });
    },
    path: path.join(destination, report[0].filename),
    report: report[0]
  };
}

function installConsumer(tarball, extraPackages = []) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-consumer-'));
  fs.writeFileSync(
    path.join(root, 'package.json'),
    `${JSON.stringify({ name: 'plugin-gjones-security-consumer', private: true, version: '1.0.0' }, null, 2)}\n`
  );

  const result = run(NPM, [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--fund=false',
    tarball,
    ...extraPackages
  ], { cwd: root });
  requireSuccess(result, 'fresh packed-consumer install');

  return {
    cleanup() {
      fs.rmSync(root, { force: true, recursive: true });
    },
    pluginRoot: path.join(root, 'node_modules/@garethpaul/plugin-gjones'),
    root
  };
}

module.exports = { NPM, ROOT, installConsumer, npmSpawnOptions, packRepository, requireSuccess, run };
