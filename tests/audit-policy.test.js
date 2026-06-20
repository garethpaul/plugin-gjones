#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { EXPECTED_ADVISORY, auditSpawnOptions, validateAuditReport } = require('../scripts/check-audit');

function cleanReport() {
  return {
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 }
    },
    vulnerabilities: {}
  };
}

function reviewedConsumerReport() {
  return {
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 6, high: 0, critical: 0, total: 6 }
    },
    vulnerabilities: {
      '@garethpaul/plugin-gjones': { severity: 'moderate', via: ['@oclif/core', '@twilio/cli-core'] },
      '@oclif/core': { severity: 'moderate', via: ['js-yaml'] },
      '@oclif/plugin-help': { severity: 'moderate', via: ['@oclif/core'] },
      '@oclif/plugin-plugins': { severity: 'moderate', via: ['@oclif/core'] },
      '@twilio/cli-core': { severity: 'moderate', via: ['@oclif/core', '@oclif/plugin-plugins'] },
      'js-yaml': { severity: 'moderate', via: [{ url: EXPECTED_ADVISORY }] }
    }
  };
}

assert.deepStrictEqual(validateAuditReport(cleanReport()), []);
assert.deepStrictEqual(validateAuditReport(reviewedConsumerReport(), { consumer: true }), []);
assert.strictEqual(auditSpawnOptions('win32').shell, true);
assert.strictEqual(auditSpawnOptions('linux').shell, false);

const newHigh = cleanReport();
newHigh.metadata.vulnerabilities.high = 1;
newHigh.metadata.vulnerabilities.total = 1;
newHigh.vulnerabilities['new-high'] = { severity: 'high', via: [] };
assert.ok(validateAuditReport(newHigh).length >= 2);

const countOnlyFinding = cleanReport();
countOnlyFinding.metadata.vulnerabilities.moderate = 1;
countOnlyFinding.metadata.vulnerabilities.total = 1;
assert.ok(validateAuditReport(countOnlyFinding).some(failure => failure.includes('vulnerability counts')));

const packageOnlyFinding = cleanReport();
packageOnlyFinding.vulnerabilities['js-yaml'] = { severity: 'moderate', via: [] };
assert.ok(validateAuditReport(packageOnlyFinding).some(failure => failure.includes('js-yaml')));

const newConsumerFinding = reviewedConsumerReport();
newConsumerFinding.metadata.vulnerabilities.high = 1;
newConsumerFinding.metadata.vulnerabilities.total = 7;
newConsumerFinding.vulnerabilities['new-high'] = { severity: 'high', via: [] };
assert.ok(validateAuditReport(newConsumerFinding, { consumer: true }).length >= 2);

const changedAdvisory = reviewedConsumerReport();
changedAdvisory.vulnerabilities['js-yaml'].via[0].url = 'https://github.com/advisories/GHSA-replacement';
assert.ok(validateAuditReport(changedAdvisory, { consumer: true }).some(failure => failure.includes('js-yaml')));

assert.ok(validateAuditReport({}).length >= 2);

console.log('dependency audit policy tests passed.');
