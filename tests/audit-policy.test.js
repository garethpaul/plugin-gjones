#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { auditSpawnOptions, validateAuditReport } = require('../scripts/check-audit');

function cleanReport() {
  return {
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 }
    },
    vulnerabilities: {}
  };
}

assert.deepStrictEqual(validateAuditReport(cleanReport()), []);
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

assert.ok(validateAuditReport({}).length >= 2);

console.log('dependency audit policy tests passed.');
