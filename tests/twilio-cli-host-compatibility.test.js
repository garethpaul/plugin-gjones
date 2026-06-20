#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const lock = require(path.join(root, 'package-lock.json'));
const launcher = fs.readFileSync(path.join(root, 'bin/run'), 'utf8');
const command = fs.readFileSync(path.join(root, 'src/commands/gjones/mycommand.js'), 'utf8');

assert.strictEqual(pkg.engines.node, '>=20.0.0');
assert.strictEqual(pkg.dependencies, undefined);
assert.deepStrictEqual(pkg.peerDependencies, {
  '@oclif/core': '>=1.26.2 <5',
  '@twilio/cli-core': '>=8.3.2 <9'
});
assert.deepStrictEqual(pkg.peerDependenciesMeta, {
  '@oclif/core': { optional: true },
  '@twilio/cli-core': { optional: true }
});
assert.strictEqual(pkg.overrides, undefined);
assert.strictEqual(lock.packages['']?.dependencies, undefined);
assert.deepStrictEqual(lock.packages['']?.peerDependencies, pkg.peerDependencies);
assert.deepStrictEqual(lock.packages['']?.peerDependenciesMeta, pkg.peerDependenciesMeta);
assert.ok(!pkg.files.includes('/bin'));
assert.ok(!launcher.includes('@twilio/cli-core'));
assert.ok(!launcher.includes('js-yaml-compat'));
assert.ok(command.includes("module.parent.require('@oclif/core')"));
assert.ok(!/^const \{ Command \} = require\('@oclif\/core'\);/m.test(command));
assert.ok(!fs.existsSync(path.join(root, 'src/js-yaml-compat.js')));

const lockedYamlVersions = Object.entries(lock.packages)
  .filter(([name]) => name.endsWith('/js-yaml'))
  .map(([, entry]) => entry.version);
assert.ok(lockedYamlVersions.length > 0);
assert.ok(lockedYamlVersions.every(version => version === '4.2.0'));

const currentMajor = Number(process.versions.node.split('.')[0]);
assert.ok(currentMajor >= 20);
for (const supportedMajor of [20, 22, 24, 25]) {
  assert.ok(supportedMajor >= Number(pkg.engines.node.match(/\d+/)[0]));
}

console.log('Twilio CLI host compatibility contract passed.');
