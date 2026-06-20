#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const { TextDecoder } = require('util');
const { canonicalFullCaseFold, verifyUnicodeCaseFoldData } = require('./unicode-casefold');

const ROOT = path.resolve(__dirname, '..');
const UTF8 = new TextDecoder('utf-8', { fatal: true });
const RESERVED_DEVICE_NAMES = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  'com1',
  'com2',
  'com3',
  'com4',
  'com5',
  'com6',
  'com7',
  'com8',
  'com9',
  'lpt1',
  'lpt2',
  'lpt3',
  'lpt4',
  'lpt5',
  'lpt6',
  'lpt7',
  'lpt8',
  'lpt9',
  'conin$',
  'conout$'
]);
const WINDOWS_SUPERSCRIPT_DIGITS = { '¹': '1', '²': '2', '³': '3' };

function safeTreeish(treeish) {
  return treeish === 'HEAD' || /^[0-9a-fA-F]{40,64}(?:\^\{tree\})?$/.test(treeish);
}

function git(repoRoot, args, gitDir) {
  const commandArgs = gitDir ? [`--git-dir=${gitDir}`, ...args] : args;
  const result = spawnSync('git', commandArgs, {
    cwd: repoRoot,
    encoding: 'buffer',
    maxBuffer: 50 * 1024 * 1024
  });
  if (result.status !== 0) {
    const stderr = result.stderr.toString('utf8').trim();
    throw new Error(stderr || `git ${commandArgs.join(' ')} exited ${result.status}`);
  }
  return result.stdout;
}

function splitNul(buffer) {
  const records = [];
  let start = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    if (buffer[index] !== 0) continue;
    if (index > start) records.push(buffer.subarray(start, index));
    start = index + 1;
  }
  if (start < buffer.length) records.push(buffer.subarray(start));
  return records;
}

function decodeUtf8(buffer, label) {
  try {
    return UTF8.decode(buffer);
  } catch (error) {
    throw new Error(`${label} contains non-UTF-8 bytes`);
  }
}

function parseLsTree(output) {
  return splitNul(output).map(record => {
    const tab = record.indexOf(0x09);
    if (tab === -1) throw new Error('git ls-tree returned an entry without a path separator');
    const header = decodeUtf8(record.subarray(0, tab), 'git ls-tree header');
    const filePath = decodeUtf8(record.subarray(tab + 1), 'git tree path');
    const match = header.match(/^([0-7]{6}) (blob|tree|commit) ([0-9a-f]{40,64})$/);
    if (!match) throw new Error(`git ls-tree returned an invalid entry header: ${header}`);
    return { mode: match[1], type: match[2], object: match[3], path: filePath };
  });
}

function gitTreeEntries(repoRoot, treeish, gitDir) {
  if (!safeTreeish(treeish)) throw new Error(`unsafe git tree-ish: ${treeish}`);
  return parseLsTree(git(repoRoot, ['ls-tree', '-rz', '-r', '-t', '--full-tree', treeish], gitDir));
}

function windowsPathKey(filePath) {
  return filePath.split('/').map(segment => canonicalFullCaseFold(segment)).join('/');
}

function validateWindowsSegment(segment, filePath) {
  const failures = [];
  if (segment.length === 0 || segment === '.' || segment === '..') {
    failures.push(`${filePath}: Windows path segment must not be empty, "." or ".."`);
  }
  if (/[<>:"\\|?*\x00-\x1F]/u.test(segment)) {
    if (segment.includes(':')) {
      failures.push(`${filePath}: Windows path segment must not contain alternate data stream separator ":"`);
    } else {
      failures.push(`${filePath}: Windows path segment contains a Windows-forbidden character`);
    }
  }
  if (/[ .]$/u.test(segment)) {
    failures.push(`${filePath}: Windows path segment must not end with a trailing dot or space`);
  }

  const trimmedForDeviceCheck = segment.replace(/[ .]+$/u, '');
  const deviceStem = trimmedForDeviceCheck.split('.')[0];
  const foldedDeviceStem = canonicalFullCaseFold(deviceStem);
  const windowsDeviceStem = foldedDeviceStem.replace(
    /^(com|lpt)([¹²³])$/u,
    (_, prefix, digit) => `${prefix}${WINDOWS_SUPERSCRIPT_DIGITS[digit]}`
  );
  if (RESERVED_DEVICE_NAMES.has(windowsDeviceStem)) {
    failures.push(`${filePath}: reserved Windows device name "${deviceStem}" is not allowed`);
  }
  return failures;
}

function validateHostedWindowsGitTree(options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const gitDir = options.gitDir;
  const treeish = options.treeish || 'HEAD';
  const failures = [];

  try {
    verifyUnicodeCaseFoldData();
  } catch (error) {
    return [error.message];
  }

  let entries;
  try {
    entries = gitTreeEntries(repoRoot, treeish, gitDir);
  } catch (error) {
    return [`hosted Windows path policy could not read git tree ${treeish}: ${error.message}`];
  }

  const seen = new Map();
  for (const entry of entries) {
    for (const segment of entry.path.split('/')) {
      failures.push(...validateWindowsSegment(segment, entry.path));
    }

    const key = windowsPathKey(entry.path);
    const previous = seen.get(key);
    if (previous && previous.path !== entry.path) {
      failures.push(`case-fold collision: ${entry.path} collides with ${previous.path} as ${key}`);
    } else {
      seen.set(key, entry);
    }
  }

  return failures;
}

function reportHostedWindowsPathFailures(failures, stream = process.stderr) {
  stream.write('Hosted Windows path policy failed:\n');
  for (const failure of failures) stream.write(`- ${failure}\n`);
}

module.exports = {
  RESERVED_DEVICE_NAMES,
  gitTreeEntries,
  reportHostedWindowsPathFailures,
  validateHostedWindowsGitTree,
  validateWindowsSegment,
  windowsPathKey
};
