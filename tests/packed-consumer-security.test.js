#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  NPM,
  installConsumer,
  packRepository,
  run
} = require('./helpers/packed-consumer');

const packed = packRepository();
const consumer = installConsumer(packed.path);

try {
  const installedManifest = JSON.parse(
    fs.readFileSync(path.join(consumer.pluginRoot, 'package.json'), 'utf8')
  );
  const audit = run(NPM, ['audit', '--audit-level=low', '--json'], { cwd: consumer.root });
  assert.ok([0, 1].includes(audit.status), `npm audit exited ${audit.status}: ${audit.stderr}`);
  const auditReport = JSON.parse(audit.stdout);
  const failures = [];

  if (Object.prototype.hasOwnProperty.call(installedManifest, 'dependencies')) {
    failures.push(`packed manifest owns runtime dependencies: ${JSON.stringify(installedManifest.dependencies)}`);
  }
  if (Object.prototype.hasOwnProperty.call(installedManifest, 'overrides')) {
    failures.push(`packed manifest publishes ineffective overrides: ${JSON.stringify(installedManifest.overrides)}`);
  }

  for (const relativePath of ['bin/run', 'bin/run.cmd', 'src/js-yaml-compat.js', 'node_modules']) {
    if (fs.existsSync(path.join(consumer.pluginRoot, relativePath))) {
      failures.push(`packed plugin must not contain ${relativePath}`);
    }
  }

  const counts = auditReport?.metadata?.vulnerabilities;
  if (!counts || counts.total !== 0) {
    failures.push(`packed consumer audit must report zero vulnerabilities: ${JSON.stringify(counts)}`);
  }
  const vulnerablePackages = Object.keys(auditReport?.vulnerabilities || {});
  if (vulnerablePackages.length !== 0) {
    failures.push(`packed consumer must have no vulnerable packages: ${vulnerablePackages.sort().join(', ')}`);
  }
  if (audit.status !== 0) {
    failures.push(`packed consumer audit must exit zero, received ${audit.status}`);
  }

  assert.deepStrictEqual(failures, []);
  console.log('packed consumer owns no vulnerable runtime dependency path.');
} finally {
  consumer.cleanup();
  packed.cleanup();
}
