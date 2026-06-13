#!/usr/bin/env node
'use strict';

const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const lock = require(path.join(root, 'package-lock.json'));
const lockedCore = lock.packages['node_modules/@twilio/cli-core'];

assert.strictEqual(pkg.engines.node, '>=24.0.0');
assert.strictEqual(pkg.dependencies['@twilio/cli-core'], '^8.3.4');
assert.ok(lockedCore, 'package-lock.json must contain @twilio/cli-core');
assert.strictEqual(Number(lockedCore.version.split('.')[0]), 8);
assert.ok(Number(process.versions.node.split('.')[0]) >= 24);

console.log('Twilio CLI host compatibility contract passed.');
