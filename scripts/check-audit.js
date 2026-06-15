#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const EXPECTED_PACKAGES = [
  '@oclif/core',
  '@oclif/plugin-help',
  '@oclif/plugin-plugins',
  '@twilio/cli-core',
  'js-yaml'
];
const EXPECTED_ADVISORY = 'https://github.com/advisories/GHSA-h67p-54hq-rp68';
const EXPECTED_VIA = {
  '@oclif/core': ['js-yaml'],
  '@oclif/plugin-help': ['@oclif/core'],
  '@oclif/plugin-plugins': ['@oclif/core'],
  '@twilio/cli-core': ['@oclif/core', '@oclif/plugin-plugins']
};

function validateAuditReport(report) {
  const failures = [];
  const counts = report?.metadata?.vulnerabilities;
  const expectedCounts = { info: 0, low: 0, moderate: 5, high: 0, critical: 0, total: 5 };

  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    failures.push(`expected vulnerability counts ${JSON.stringify(expectedCounts)}, received ${JSON.stringify(counts)}`);
  }

  const vulnerabilities = report?.vulnerabilities;
  const packageNames = vulnerabilities && typeof vulnerabilities === 'object'
    ? Object.keys(vulnerabilities).sort()
    : [];
  if (JSON.stringify(packageNames) !== JSON.stringify(EXPECTED_PACKAGES)) {
    failures.push(`expected only ${EXPECTED_PACKAGES.join(', ')}, received ${packageNames.join(', ') || 'none'}`);
  }

  for (const packageName of EXPECTED_PACKAGES) {
    const vulnerability = vulnerabilities?.[packageName];
    if (!vulnerability || vulnerability.severity !== 'moderate') {
      failures.push(`${packageName} must remain an explicitly reviewed moderate finding`);
    }
  }

  for (const [packageName, expectedVia] of Object.entries(EXPECTED_VIA)) {
    if (JSON.stringify(vulnerabilities?.[packageName]?.via) !== JSON.stringify(expectedVia)) {
      failures.push(`${packageName} must inherit only the reviewed js-yaml advisory chain`);
    }
  }

  const jsYamlAdvisories = vulnerabilities?.['js-yaml']?.via?.filter(item => typeof item === 'object') || [];
  if (jsYamlAdvisories.length !== 1 || jsYamlAdvisories[0].url !== EXPECTED_ADVISORY) {
    failures.push(`js-yaml must be linked only to ${EXPECTED_ADVISORY}`);
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

  console.log(`Dependency audit matched the reviewed upstream blocker: ${EXPECTED_ADVISORY}.`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { EXPECTED_ADVISORY, auditSpawnOptions, validateAuditReport };
