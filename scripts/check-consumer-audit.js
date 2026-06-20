#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { validateAuditReport } = require('./check-audit');

const ROOT = path.resolve(__dirname, '..');

function auditSpawnOptions(platform = process.platform) {
  return {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    shell: platform === 'win32'
  };
}

function findPackedArtifact(files) {
  const artifacts = files.filter(file => file.endsWith('.tgz'));
  if (artifacts.length !== 1) {
    throw new Error(`expected exactly one packed artifact, received ${artifacts.length}`);
  }
  return artifacts[0];
}

function parseAuditOutput(result) {
  if (![0, 1].includes(result.status)) {
    throw new Error(`npm audit exited unexpectedly with status ${result.status}`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`npm audit did not return JSON: ${error.message}`);
  }
}

function run(npm, args, options = {}) {
  const result = spawnSync(npm, args, {
    ...auditSpawnOptions(),
    ...options,
    env: {
      ...process.env,
      npm_config_update_notifier: 'false',
      ...options.env
    }
  });
  if (result.error) throw result.error;
  return result;
}

function main() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-consumer-'));
  const packDirectory = path.join(temporaryRoot, 'pack');
  const consumerDirectory = path.join(temporaryRoot, 'consumer');

  try {
    fs.mkdirSync(packDirectory);
    fs.mkdirSync(consumerDirectory);
    fs.writeFileSync(
      path.join(consumerDirectory, 'package.json'),
      `${JSON.stringify({ name: 'plugin-gjones-consumer-check', private: true, version: '1.0.0' }, null, 2)}\n`,
      { mode: 0o600 }
    );

    const pack = run(npm, ['pack', '--pack-destination', packDirectory], { cwd: ROOT });
    if (pack.status !== 0) throw new Error(pack.stderr || pack.stdout || 'npm pack failed');

    const artifact = findPackedArtifact(fs.readdirSync(packDirectory));
    const artifactPath = path.join(packDirectory, artifact);
    if (fs.statSync(artifactPath).size > 1024 * 1024) {
      throw new Error('packed plugin exceeds the reviewed 1 MiB limit');
    }

    const install = run(npm, ['install', '--ignore-scripts', '--no-fund', artifactPath], { cwd: consumerDirectory });
    if (install.status !== 0) throw new Error(install.stderr || install.stdout || 'consumer install failed');

    const audit = run(npm, ['audit', '--audit-level=low', '--json'], { cwd: consumerDirectory });
    const failures = validateAuditReport(parseAuditOutput(audit), { consumer: true });
    if (failures.length > 0) {
      throw new Error(`packed consumer audit policy failed:\n- ${failures.join('\n- ')}`);
    }

    console.log('packed consumer audit matched the reviewed upstream advisory boundary.');
  } finally {
    fs.rmSync(temporaryRoot, { force: true, recursive: true });
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { auditSpawnOptions, findPackedArtifact, parseAuditOutput };
