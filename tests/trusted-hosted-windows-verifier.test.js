#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github/workflows/trusted-hosted-windows-path-policy.yml');
const verifierPath = path.join(root, '.github/trusted/verify-hosted-windows-path-policy.js');

const workflow = fs.readFileSync(workflowPath, 'utf8');
const verifier = fs.readFileSync(verifierPath, 'utf8');

assert.match(workflow, /^on:\n  pull_request_target:/m);
assert.match(workflow, /^permissions:\n  contents: read\n  pull-requests: read$/m);
assert.doesNotMatch(workflow, /^\s+[\w-]+:\s+write\s*$/m);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /git fetch --no-tags --filter=blob:none pr "\$HEAD_SHA"/);
assert.match(workflow, /node \.github\/trusted\/verify-hosted-windows-path-policy\.js "\$HEAD_SHA\^\{tree\}"/);
assert.doesNotMatch(workflow, /npm (ci|install|test|run)/);
assert.doesNotMatch(workflow, /ref: \$\{\{ github\.event\.pull_request\.head/);

assert.match(verifier, /require\('\.\.\/\.\.\/scripts\/hosted-windows-path-policy'\)/);
assert.doesNotMatch(verifier, /require\('\.\.\/\.\.\/tests\//);
assert.doesNotMatch(verifier, /child_process/);

console.log('trusted hosted Windows verifier tests passed.');
