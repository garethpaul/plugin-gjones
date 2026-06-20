#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

function validateAuditReport(report) {
  const failures = [];
  const counts = report?.metadata?.vulnerabilities;
  const expectedCounts = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };

  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    failures.push(`expected vulnerability counts ${JSON.stringify(expectedCounts)}, received ${JSON.stringify(counts)}`);
  }

  const vulnerabilities = report?.vulnerabilities;
  if (!vulnerabilities || typeof vulnerabilities !== 'object' || Array.isArray(vulnerabilities)) {
    failures.push('audit report must include a vulnerable-package map');
  }
  const packageNames = vulnerabilities && typeof vulnerabilities === 'object' ? Object.keys(vulnerabilities) : [];
  if (packageNames.length !== 0) {
    failures.push(`expected no vulnerable packages, received ${packageNames.sort().join(', ')}`);
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

module.exports = { auditSpawnOptions, validateAuditReport };
