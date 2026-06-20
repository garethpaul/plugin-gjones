#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'scripts/data/unicode-17-casefold-cf.json');
const SOURCE_PATH = path.join(ROOT, 'vendor/unicode/17.0.0/CaseFolding.txt');

const EXPECTED_UNICODE_VERSION = '17.0.0';
const EXPECTED_SOURCE_SHA256 = 'ff8d8fefbf123574205085d6714c36149eb946d717a0c585c27f0f4ef58c4183';
const EXPECTED_MAPPING_COUNT = 1585;
const EXPECTED_MAPPING_SHA256 = 'b41eea2dea84d468d8c4330d4acb90d94f97c848a1448af150574ae8397913a3';

let cached;

function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function canonicalText(content) {
  return content.replace(/\r\n/g, '\n');
}

function canonicalMappingText(mappings) {
  return mappings.map(([sourceCodePoint, mapping]) => {
    if (!Number.isInteger(sourceCodePoint) || sourceCodePoint < 0 || sourceCodePoint > 0x10FFFF) {
      throw new Error(`invalid source code point in Unicode case-fold table: ${sourceCodePoint}`);
    }
    if (!Array.isArray(mapping) || mapping.length === 0) {
      throw new Error(`invalid mapping for U+${sourceCodePoint.toString(16).toUpperCase()}`);
    }
    for (const mapped of mapping) {
      if (!Number.isInteger(mapped) || mapped < 0 || mapped > 0x10FFFF) {
        throw new Error(`invalid mapped code point for U+${sourceCodePoint.toString(16).toUpperCase()}: ${mapped}`);
      }
    }
    return `${sourceCodePoint.toString(16).toUpperCase()};${mapping.map(cp => cp.toString(16).toUpperCase()).join(' ')}`;
  }).join('\n') + '\n';
}

function verifyUnicodeCaseFoldData() {
  try {
    const source = canonicalText(fs.readFileSync(SOURCE_PATH, 'utf8'));
    const table = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const sourceDigest = sha256(source);

    if (table.unicodeVersion !== EXPECTED_UNICODE_VERSION) {
      throw new Error(`expected Unicode ${EXPECTED_UNICODE_VERSION}, received ${table.unicodeVersion}`);
    }
    if (table.source !== 'vendor/unicode/17.0.0/CaseFolding.txt') {
      throw new Error(`unexpected source path ${table.source}`);
    }
    if (sourceDigest !== EXPECTED_SOURCE_SHA256 || table.sourceSha256 !== EXPECTED_SOURCE_SHA256) {
      throw new Error(`CaseFolding.txt SHA-256 mismatch: expected ${EXPECTED_SOURCE_SHA256}, received source ${sourceDigest} and table ${table.sourceSha256}`);
    }
    if (JSON.stringify(table.statuses) !== JSON.stringify(['C', 'F'])) {
      throw new Error(`unexpected case-fold statuses ${JSON.stringify(table.statuses)}`);
    }
    if (!Array.isArray(table.mappings) || table.mappings.length !== EXPECTED_MAPPING_COUNT || table.mappingCount !== EXPECTED_MAPPING_COUNT) {
      throw new Error(`expected ${EXPECTED_MAPPING_COUNT} case-fold mappings, received ${table.mappingCount}`);
    }

    let previous = -1;
    for (const [sourceCodePoint] of table.mappings) {
      if (sourceCodePoint <= previous) throw new Error('case-fold mappings must be strictly sorted by code point');
      previous = sourceCodePoint;
    }

    const mappingDigest = sha256(canonicalMappingText(table.mappings));
    if (mappingDigest !== EXPECTED_MAPPING_SHA256 || table.mappingSha256 !== EXPECTED_MAPPING_SHA256) {
      throw new Error(`case-fold mapping SHA-256 mismatch: expected ${EXPECTED_MAPPING_SHA256}, received mapping ${mappingDigest} and table ${table.mappingSha256}`);
    }

    return Object.freeze({
      unicodeVersion: table.unicodeVersion,
      sourceSha256: sourceDigest,
      mappingSha256: mappingDigest,
      mappings: table.mappings
    });
  } catch (error) {
    throw new Error(`Unicode 17 case-fold table integrity failure: ${error.message}`);
  }
}

function caseFoldMap() {
  if (cached) return cached;
  const verified = verifyUnicodeCaseFoldData();
  cached = new Map(verified.mappings.map(([sourceCodePoint, mapping]) => [sourceCodePoint, mapping]));
  return cached;
}

function fullCaseFold(input) {
  const map = caseFoldMap();
  let output = '';
  for (const character of input) {
    const sourceCodePoint = character.codePointAt(0);
    const mapping = map.get(sourceCodePoint);
    output += String.fromCodePoint(...(mapping || [sourceCodePoint]));
  }
  return output;
}

function canonicalFullCaseFold(input) {
  return fullCaseFold(input.normalize('NFC')).normalize('NFC');
}

if (require.main === module) {
  const verified = verifyUnicodeCaseFoldData();
  console.log(`Unicode ${verified.unicodeVersion} C/F case-fold table verified.`);
  console.log(`source sha256: ${verified.sourceSha256}`);
  console.log(`mapping sha256: ${verified.mappingSha256}`);
}

module.exports = {
  EXPECTED_MAPPING_COUNT,
  EXPECTED_MAPPING_SHA256,
  EXPECTED_SOURCE_SHA256,
  EXPECTED_UNICODE_VERSION,
  canonicalFullCaseFold,
  fullCaseFold,
  verifyUnicodeCaseFoldData
};
