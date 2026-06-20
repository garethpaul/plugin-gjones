#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { ZERO_COUNTS, auditSpawnOptions, validateAuditReport } = require('../scripts/check-audit');

function auditReport(vulnerabilities = {}, counts = { ...ZERO_COUNTS }) {
  return { metadata: { vulnerabilities: counts }, vulnerabilities };
}

assert.deepStrictEqual(validateAuditReport(auditReport()), []);
assert.strictEqual(auditSpawnOptions('win32').shell, true);
assert.strictEqual(auditSpawnOptions('linux').shell, false);

const jsYamlFinding = auditReport(
  {
    'js-yaml': {
      name: 'js-yaml',
      severity: 'moderate',
      via: [{ url: 'https://github.com/advisories/GHSA-h67p-54hq-rp68' }]
    }
  },
  { ...ZERO_COUNTS, moderate: 1, total: 1 }
);
const directFailures = validateAuditReport(jsYamlFinding);
assert.ok(directFailures.some(failure => failure.includes('expected zero vulnerabilities')));
assert.ok(directFailures.some(failure => failure.includes('js-yaml')));

const inheritedFinding = auditReport(
  {
    '@garethpaul/plugin-gjones': {
      name: '@garethpaul/plugin-gjones',
      severity: 'moderate',
      via: ['js-yaml']
    }
  },
  { ...ZERO_COUNTS, moderate: 1, total: 1 }
);
assert.ok(
  validateAuditReport(inheritedFinding).some(failure => failure.includes('@garethpaul/plugin-gjones')),
  'consumer findings inherited through this package must fail closed'
);

const countOnlyFinding = auditReport({}, { ...ZERO_COUNTS, high: 1, total: 1 });
assert.ok(validateAuditReport(countOnlyFinding).some(failure => failure.includes('expected zero vulnerabilities')));

const packageOnlyFinding = auditReport({ unexpected: { severity: 'low', via: [] } });
assert.ok(validateAuditReport(packageOnlyFinding).some(failure => failure.includes('unexpected')));
assert.ok(validateAuditReport({}).length >= 2);

console.log('dependency audit policy tests passed.');
