#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const lock = require(path.join(root, 'package-lock.json'));
const lockedCore = lock.packages['node_modules/@twilio/cli-core'];
const launcher = fs.readFileSync(path.join(root, 'bin/run'), 'utf8');

assert.strictEqual(pkg.engines.node, '>=20.0.0');
assert.strictEqual(pkg.dependencies['@twilio/cli-core'], '^8.3.4');
assert.deepStrictEqual(pkg.overrides, {
  'form-data': '4.0.6',
  'js-yaml': '4.2.0',
  undici: '6.27.0'
});
assert.ok(lockedCore, 'package-lock.json must contain @twilio/cli-core');
assert.strictEqual(Number(lockedCore.version.split('.')[0]), 8);
assert.strictEqual(lock.packages['node_modules/form-data'].version, '4.0.6');
assert.strictEqual(lock.packages['node_modules/undici'].version, '6.27.0');
assert.strictEqual(lock.packages['node_modules/js-yaml'].version, '4.2.0');
assert.strictEqual(lock.packages['node_modules/@oclif/core/node_modules/js-yaml'], undefined);
assert.strictEqual(lock.packages['node_modules/@oclif/plugin-help/node_modules/js-yaml'], undefined);
assert.ok(launcher.indexOf("require('../src/js-yaml-compat')") < launcher.indexOf("require('@oclif/core')"));
assert.ok(fs.existsSync(path.join(root, 'src/js-yaml-compat.js')));
assert.ok(Number(process.versions.node.split('.')[0]) >= 20);

for (const supportedMajor of [20, 22, 24]) {
  assert.ok(supportedMajor >= Number(pkg.engines.node.match(/\d+/)[0]));
}

console.log('Twilio CLI host compatibility contract passed.');
