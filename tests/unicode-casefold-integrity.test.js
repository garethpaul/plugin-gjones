#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  EXPECTED_MAPPING_COUNT,
  EXPECTED_MAPPING_SHA256,
  EXPECTED_SOURCE_SHA256,
  EXPECTED_UNICODE_VERSION,
  canonicalFullCaseFold,
  fullCaseFold,
  verifyUnicodeCaseFoldData
} = require('../scripts/unicode-casefold');

const root = path.resolve(__dirname, '..');
const verified = verifyUnicodeCaseFoldData();

assert.strictEqual(EXPECTED_UNICODE_VERSION, '17.0.0');
assert.strictEqual(verified.unicodeVersion, EXPECTED_UNICODE_VERSION);
assert.strictEqual(verified.sourceSha256, EXPECTED_SOURCE_SHA256);
assert.strictEqual(verified.mappingSha256, EXPECTED_MAPPING_SHA256);
assert.strictEqual(verified.mappings.length, EXPECTED_MAPPING_COUNT);
assert.strictEqual(fullCaseFold('𖺠'), '𖺻');
assert.strictEqual(fullCaseFold('Fuß'), 'fuss');
assert.strictEqual(fullCaseFold('ẞ'), 'ss');
assert.strictEqual(fullCaseFold('Σς'), 'σσ');
assert.strictEqual(fullCaseFold('İ'), 'i\u0307');
assert.strictEqual(canonicalFullCaseFold('Cafe\u0301.md'), canonicalFullCaseFold('Café.md'));

const unicodeSource = fs.readFileSync(path.join(root, 'scripts/unicode-casefold.js'), 'utf8');
const pathPolicySource = fs.readFileSync(path.join(root, 'scripts/hosted-windows-path-policy.js'), 'utf8');
assert.doesNotMatch(`${unicodeSource}\n${pathPolicySource}`, /\.toLocaleLowerCase\s*\(/);
assert.doesNotMatch(`${unicodeSource}\n${pathPolicySource}`, /\.toLowerCase\s*\(/);

function expectIntegrityFailure(name, patchBody, expectedPattern) {
  const script = `
    'use strict';
    const fs = require('fs');
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = function patchedReadFileSync(target, ...args) {
      const normalized = String(target).replace(/\\\\/g, '/');
      ${patchBody}
      return originalReadFileSync.call(fs, target, ...args);
    };
    const { verifyUnicodeCaseFoldData } = require('./scripts/unicode-casefold');
    try {
      verifyUnicodeCaseFoldData();
      console.error('integrity check unexpectedly passed');
      process.exit(2);
    } catch (error) {
      console.error(error.message);
      if (!${expectedPattern}.test(error.message)) process.exit(3);
    }
  `;
  const result = spawnSync(process.execPath, ['-e', script], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  assert.strictEqual(
    result.status,
    0,
    `${name} must fail closed with the expected integrity error.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
}

function expectIntegrityPass(name, patchBody) {
  const script = `
    'use strict';
    const fs = require('fs');
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = function patchedReadFileSync(target, ...args) {
      const normalized = String(target).replace(/\\\\/g, '/');
      ${patchBody}
      return originalReadFileSync.call(fs, target, ...args);
    };
    const { verifyUnicodeCaseFoldData } = require('./scripts/unicode-casefold');
    verifyUnicodeCaseFoldData();
  `;
  const result = spawnSync(process.execPath, ['-e', script], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  assert.strictEqual(
    result.status,
    0,
    `${name} must preserve Unicode table integrity.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
}

expectIntegrityPass(
  'CRLF checkout of source artifact',
  `
      if (normalized.endsWith('/vendor/unicode/17.0.0/CaseFolding.txt')) {
        return originalReadFileSync.call(fs, target, ...args)
          .replace(/\\r\\n/g, '\\n')
          .replace(/\\n/g, '\\r\\n');
      }
  `
);

expectIntegrityFailure(
  'source artifact corruption',
  `
      if (normalized.endsWith('/vendor/unicode/17.0.0/CaseFolding.txt')) {
        return originalReadFileSync.call(fs, target, ...args) + '\\n# corrupt';
      }
  `,
  /SHA-256 mismatch/
);

expectIntegrityFailure(
  'table version mismatch',
  `
      if (normalized.endsWith('/scripts/data/unicode-17-casefold-cf.json')) {
        const table = JSON.parse(originalReadFileSync.call(fs, target, ...args));
        table.unicodeVersion = '16.0.0';
        return JSON.stringify(table);
      }
  `,
  /expected Unicode 17\.0\.0/
);

expectIntegrityFailure(
  'generated mapping corruption',
  `
      if (normalized.endsWith('/scripts/data/unicode-17-casefold-cf.json')) {
        const table = JSON.parse(originalReadFileSync.call(fs, target, ...args));
        table.mappings[0][1] = [table.mappings[0][0]];
        return JSON.stringify(table);
      }
  `,
  /case-fold mapping SHA-256 mismatch/
);

console.log('Unicode case-fold integrity tests passed.');
