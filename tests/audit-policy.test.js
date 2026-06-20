#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { EXPECTED_ADVISORY, auditSpawnOptions, validateAuditReport } = require('../scripts/check-audit');

function reviewedReport({ consumer = false } = {}) {
  const vulnerabilities = {
    '@oclif/core': { name: '@oclif/core', severity: 'moderate', via: ['js-yaml'] },
    '@oclif/plugin-help': { name: '@oclif/plugin-help', severity: 'moderate', via: ['@oclif/core'] },
    '@oclif/plugin-plugins': { name: '@oclif/plugin-plugins', severity: 'moderate', via: ['@oclif/core'] },
    '@twilio/cli-core': {
      name: '@twilio/cli-core',
      severity: 'moderate',
      via: ['@oclif/core', '@oclif/plugin-plugins']
    },
    'js-yaml': {
      name: 'js-yaml',
      severity: 'moderate',
      via: [{ url: EXPECTED_ADVISORY, severity: 'moderate' }]
    }
  };

  if (consumer) {
    vulnerabilities['@garethpaul/plugin-gjones'] = {
      name: '@garethpaul/plugin-gjones',
      severity: 'moderate',
      via: ['@oclif/core', '@twilio/cli-core']
    };
  }

  const moderate = consumer ? 6 : 5;
  return {
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate, high: 0, critical: 0, total: moderate }
    },
    vulnerabilities
  };
}

assert.deepStrictEqual(validateAuditReport(reviewedReport()), []);
assert.deepStrictEqual(validateAuditReport(reviewedReport({ consumer: true }), { consumer: true }), []);
assert.strictEqual(auditSpawnOptions('win32').shell, true);
assert.strictEqual(auditSpawnOptions('linux').shell, false);

const newHigh = reviewedReport();
newHigh.metadata.vulnerabilities.high = 1;
newHigh.metadata.vulnerabilities.total = 6;
newHigh.vulnerabilities['new-high'] = { severity: 'high', via: [] };
assert.ok(validateAuditReport(newHigh).length >= 2);

const countOnlyFinding = reviewedReport();
countOnlyFinding.metadata.vulnerabilities.moderate = 6;
countOnlyFinding.metadata.vulnerabilities.total = 6;
assert.ok(validateAuditReport(countOnlyFinding).some(failure => failure.includes('vulnerability counts')));

const changedAdvisory = reviewedReport();
changedAdvisory.vulnerabilities['js-yaml'].via[0].url = 'https://example.invalid/advisory';
assert.ok(validateAuditReport(changedAdvisory).some(failure => failure.includes(EXPECTED_ADVISORY)));

const additionalInheritedAdvisory = reviewedReport();
additionalInheritedAdvisory.vulnerabilities['@oclif/core'].via.push({ url: 'https://example.invalid/new-advisory' });
assert.ok(validateAuditReport(additionalInheritedAdvisory).some(failure => failure.includes('@oclif/core')));

const missingPackage = reviewedReport();
delete missingPackage.vulnerabilities['@oclif/plugin-help'];
assert.ok(validateAuditReport(missingPackage).some(failure => failure.includes('@oclif/plugin-help')));

assert.ok(validateAuditReport({}).length >= 2);

console.log('dependency audit policy tests passed.');
