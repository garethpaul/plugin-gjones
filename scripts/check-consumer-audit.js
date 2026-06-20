#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { validateAuditReport } = require('./check-audit');

const ROOT = path.resolve(__dirname, '..');
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

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

function validatePackedManifest(manifest, pluginRoot) {
  const failures = [];
  if (Object.prototype.hasOwnProperty.call(manifest, 'dependencies')) {
    failures.push('packed plugin must not own runtime dependencies');
  }
  if (Object.prototype.hasOwnProperty.call(manifest, 'overrides')) {
    failures.push('packed plugin must not publish dependency overrides');
  }
  for (const relativePath of ['bin/run', 'bin/run.cmd', 'src/js-yaml-compat.js', 'node_modules']) {
    if (fs.existsSync(`${pluginRoot}${path.sep}${relativePath}`)) {
      failures.push(`packed plugin must not contain ${relativePath}`);
    }
  }
  return failures;
}

function run(args, options = {}) {
  const result = spawnSync(NPM, args, {
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

    const pack = run(['pack', '--pack-destination', packDirectory], { cwd: ROOT });
    if (pack.status !== 0) throw new Error(pack.stderr || pack.stdout || 'npm pack failed');

    const artifact = findPackedArtifact(fs.readdirSync(packDirectory));
    const artifactPath = path.join(packDirectory, artifact);
    if (fs.statSync(artifactPath).size > 1024 * 1024) {
      throw new Error('packed plugin exceeds the reviewed 1 MiB limit');
    }

    const install = run(['install', '--ignore-scripts', '--no-audit', '--no-fund', artifactPath], { cwd: consumerDirectory });
    if (install.status !== 0) throw new Error(install.stderr || install.stdout || 'consumer install failed');

    const pluginRoot = path.join(consumerDirectory, 'node_modules/@garethpaul/plugin-gjones');
    const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'package.json'), 'utf8'));
    const failures = validatePackedManifest(manifest, pluginRoot);
    const audit = run(['audit', '--audit-level=low', '--json'], { cwd: consumerDirectory });
    failures.push(...validateAuditReport(parseAuditOutput(audit)));
    if (audit.status !== 0) failures.push(`packed consumer npm audit exited ${audit.status}`);

    if (failures.length > 0) {
      throw new Error(`packed consumer audit policy failed:\n- ${failures.join('\n- ')}`);
    }

    console.log('packed consumer audit reported zero plugin-owned findings.');
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

module.exports = { auditSpawnOptions, findPackedArtifact, parseAuditOutput, validatePackedManifest };
