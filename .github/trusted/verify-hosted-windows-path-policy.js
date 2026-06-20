#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  reportHostedWindowsPathFailures,
  validateHostedWindowsGitTree
} = require('../../scripts/hosted-windows-path-policy');

function main() {
  const gitDir = process.argv[2];
  const treeish = process.argv[3];
  if (!gitDir || !treeish) {
    throw new Error('usage: verify-hosted-windows-path-policy.js <git-dir> <tree-ish>');
  }
  if (!path.isAbsolute(gitDir)) throw new Error('git directory must be an absolute path');

  const failures = validateHostedWindowsGitTree({
    gitDir,
    treeish,
    requiredEntries: [{ path: 'bin/run', mode: '100755', type: 'blob' }]
  });
  if (failures.length > 0) {
    reportHostedWindowsPathFailures(failures);
    process.exitCode = 1;
    return;
  }

  console.log(`Trusted hosted Windows path policy passed for ${treeish}.`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { main };
