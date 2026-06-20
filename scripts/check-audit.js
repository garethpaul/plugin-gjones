#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const ZERO_COUNTS = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };

function validateAuditReport(report) {
  const failures = [];
  const counts = report?.metadata?.vulnerabilities;
  if (JSON.stringify(counts) !== JSON.stringify(ZERO_COUNTS)) {
    failures.push(`expected zero vulnerabilities, received ${JSON.stringify(counts)}`);
  }

  const vulnerabilities = report?.vulnerabilities;
  if (!vulnerabilities || typeof vulnerabilities !== 'object' || Array.isArray(vulnerabilities)) {
    failures.push('audit report must include a vulnerable-package map');
  } else {
    for (const name of Object.keys(vulnerabilities).sort()) {
      failures.push(`unexpected advisory path through ${name}`);
    }
  }

  return failures;
}

function auditSpawnOptions(platform = process.platform) {
  return {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    shell: platform === 'win32'
  };
}

function main() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['audit', '--audit-level=low', '--json'], auditSpawnOptions());

  if (result.error) throw result.error;
  if (![0, 1].includes(result.status)) {
    throw new Error(`npm audit exited unexpectedly with status ${result.status}`);
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`npm audit did not return JSON: ${error.message}`);
  }

  const failures = validateAuditReport(report);
  if (failures.length > 0) {
    console.error('Dependency audit policy failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  if (result.status !== 0) {
    throw new Error(`npm audit reported no findings but exited ${result.status}`);
  }
  console.log('Dependency audit reported zero known vulnerabilities.');
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { ZERO_COUNTS, auditSpawnOptions, validateAuditReport };
