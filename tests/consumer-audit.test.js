#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  auditSpawnOptions,
  findPackedArtifact,
  parseAuditOutput,
  validatePackedManifest
} = require('../scripts/check-consumer-audit');

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

const pluginRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-gjones-manifest-'));
try {
  assert.deepStrictEqual(validatePackedManifest({}, pluginRoot), []);
  fs.mkdirSync(path.join(pluginRoot, 'node_modules'));
  const failures = validatePackedManifest({ dependencies: { unsafe: '1.0.0' }, overrides: { unsafe: '2.0.0' } }, pluginRoot);
  assert.ok(failures.some(failure => failure.includes('runtime dependencies')));
  assert.ok(failures.some(failure => failure.includes('dependency overrides')));
  assert.ok(failures.some(failure => failure.includes('node_modules')));
} finally {
  fs.rmSync(pluginRoot, { force: true, recursive: true });
}

console.log('consumer audit helper tests passed.');
