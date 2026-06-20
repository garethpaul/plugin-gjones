#!/usr/bin/env node
'use strict';

const {
  reportHostedWindowsPathFailures,
  validateHostedWindowsGitTree
} = require('../../scripts/hosted-windows-path-policy');

function main() {
  const treeish = process.argv[2];
  if (!treeish) throw new Error('usage: verify-hosted-windows-path-policy.js <tree-ish>');

  const failures = validateHostedWindowsGitTree({ treeish });
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
