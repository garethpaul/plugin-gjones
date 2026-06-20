#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github/workflows/trusted-hosted-windows-path-policy.yml');
const verifierPath = path.join(root, '.github/trusted/verify-hosted-windows-path-policy.js');

function readNormalized(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

const workflow = readNormalized(workflowPath);
const verifier = readNormalized(verifierPath);

assert.match(workflow, /^on:\n  pull_request_target:/m);
assert.match(workflow, /^permissions:\n  contents: read\n  pull-requests: read$/m);
assert.doesNotMatch(workflow, /^\s+[\w-]+:\s+write\s*$/m);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
assert.match(workflow, /git init --bare "\$PR_GIT_DIR"/);
assert.match(workflow, /git --git-dir="\$PR_GIT_DIR"[\s\S]+fetch --no-tags --filter=blob:none pr/);
assert.match(workflow, /"\$HEAD_SHA:refs\/trusted\/head"/);
assert.match(workflow, /node \.github\/trusted\/verify-hosted-windows-path-policy\.js "\$PR_GIT_DIR" "\$HEAD_SHA\^\{tree\}"/);
assert.doesNotMatch(workflow, /npm (ci|install|test|run)/);
assert.doesNotMatch(workflow, /ref: \$\{\{ github\.event\.pull_request\.head/);

assert.match(verifier, /require\('\.\.\/\.\.\/scripts\/hosted-windows-path-policy'\)/);
assert.match(verifier, /gitDir/);
assert.doesNotMatch(verifier, /require\('\.\.\/\.\.\/tests\//);
assert.doesNotMatch(verifier, /child_process/);

console.log('trusted hosted Windows verifier tests passed.');
