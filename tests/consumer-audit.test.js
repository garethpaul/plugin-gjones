#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { auditSpawnOptions, findPackedArtifact, parseAuditOutput } = require('../scripts/check-consumer-audit');

assert.strictEqual(findPackedArtifact(['plugin.tgz']), 'plugin.tgz');
assert.throws(() => findPackedArtifact([]), /exactly one packed artifact/);
assert.throws(() => findPackedArtifact(['one.tgz', 'two.tgz']), /exactly one packed artifact/);
assert.throws(() => findPackedArtifact(['plugin.zip']), /exactly one packed artifact/);

assert.deepStrictEqual(
  parseAuditOutput({ status: 1, stdout: '{"metadata":{"vulnerabilities":{}},"vulnerabilities":{}}' }),
  { metadata: { vulnerabilities: {} }, vulnerabilities: {} }
);
assert.throws(() => parseAuditOutput({ status: 2, stdout: '{}' }), /unexpectedly/);
assert.throws(() => parseAuditOutput({ status: 1, stdout: 'not json' }), /did not return JSON/);

assert.strictEqual(auditSpawnOptions('win32').shell, true);
assert.strictEqual(auditSpawnOptions('linux').shell, false);

console.log('consumer audit helper tests passed.');
