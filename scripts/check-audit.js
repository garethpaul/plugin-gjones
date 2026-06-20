#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const EXPECTED_ADVISORY = 'https://github.com/advisories/GHSA-h67p-54hq-rp68';
const EXPECTED_CONSUMER_VIA = {
  '@garethpaul/plugin-gjones': ['@oclif/core', '@twilio/cli-core'],
  '@oclif/core': ['js-yaml'],
  '@oclif/plugin-help': ['@oclif/core'],
  '@oclif/plugin-plugins': ['@oclif/core'],
  '@twilio/cli-core': ['@oclif/core', '@oclif/plugin-plugins'],
  'js-yaml': [EXPECTED_ADVISORY]
};

function viaIdentifiers(via) {
  return (Array.isArray(via) ? via : []).map(item => typeof item === 'string' ? item : item.url).sort();
}

function validateAuditReport(report, { consumer = false } = {}) {
  const failures = [];
  const counts = report?.metadata?.vulnerabilities;
  const expectedCounts = consumer
    ? { info: 0, low: 0, moderate: 6, high: 0, critical: 0, total: 6 }
    : { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };

  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    failures.push(`expected vulnerability counts ${JSON.stringify(expectedCounts)}, received ${JSON.stringify(counts)}`);
  }

  const vulnerabilities = report?.vulnerabilities;
  if (!vulnerabilities || typeof vulnerabilities !== 'object' || Array.isArray(vulnerabilities)) {
    failures.push('audit report must include a vulnerable-package map');
  }
  const packageNames = vulnerabilities && typeof vulnerabilities === 'object' ? Object.keys(vulnerabilities).sort() : [];
  if (!consumer) {
    if (packageNames.length !== 0) {
      failures.push(`expected no vulnerable packages, received ${packageNames.join(', ')}`);
    }
    return failures;
  }

  const expectedNames = Object.keys(EXPECTED_CONSUMER_VIA).sort();
  if (JSON.stringify(packageNames) !== JSON.stringify(expectedNames)) {
    failures.push(`expected vulnerable packages ${expectedNames.join(', ')}, received ${packageNames.join(', ')}`);
  }

  for (const [name, expected] of Object.entries(EXPECTED_CONSUMER_VIA)) {
    const finding = vulnerabilities?.[name];
    if (!finding) {
      failures.push(`expected reviewed advisory package ${name}`);
      continue;
    }
    if (finding.severity !== 'moderate') {
      failures.push(`${name} must remain moderate, received ${finding.severity}`);
    }
    const actualVia = viaIdentifiers(finding.via);
    if (JSON.stringify(actualVia) !== JSON.stringify([...expected].sort())) {
      failures.push(`${name} must only inherit reviewed paths ${[...expected].sort().join(', ')}, received ${actualVia.join(', ')}`);
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

module.exports = { EXPECTED_ADVISORY, auditSpawnOptions, validateAuditReport };
