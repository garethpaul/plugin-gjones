#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const Module = require('module');
const path = require('path');
const { createRequire } = require('module');
const { installConsumer, packRepository } = require('./helpers/packed-consumer');

function javascriptFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...javascriptFiles(absolute));
    if (entry.isFile() && entry.name.endsWith('.js')) files.push(absolute);
  }
  return files.sort();
}

const packed = packRepository();
const consumer = installConsumer(packed.path, ['js-yaml@3.14.2']);

try {
  const hostRequire = createRequire(path.join(consumer.root, 'package.json'));
  const yaml = hostRequire('js-yaml');
  const originalSafeLoad = yaml.safeLoad;
  const originalSafeDump = yaml.safeDump;
  const originalLoad = Module._load;

  Module._load = function loadWithHostOclif(request, parent, isMain) {
    if (request === '@oclif/core') return { Command: class Command {} };
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    for (const file of javascriptFiles(path.join(consumer.pluginRoot, 'src'))) {
      require(file);
    }
  } finally {
    Module._load = originalLoad;
  }

  assert.strictEqual(yaml.safeLoad, originalSafeLoad, 'plugin must not replace host safeLoad');
  assert.strictEqual(yaml.safeDump, originalSafeDump, 'plugin must not replace host safeDump');
  assert.throws(
    () => yaml.safeLoad('payload: !!js/function >\n  function () { return 42; }'),
    /unknown tag|cannot resolve a node with !<tag:yaml.org,2002:js\/function>/i,
    'host safeLoad must reject executable YAML tags after every plugin module loads'
  );

  for (const file of javascriptFiles(path.join(consumer.pluginRoot, 'src'))) {
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(!source.includes('js-yaml'), `${path.relative(consumer.pluginRoot, file)} must not load js-yaml`);
    assert.ok(!/\.safe(?:Load|Dump)\s*=/.test(source), `${path.relative(consumer.pluginRoot, file)} must not overwrite safe YAML APIs`);
  }

  console.log('packed plugin preserves host safe YAML APIs and rejects executable tags.');
} finally {
  consumer.cleanup();
  packed.cleanup();
}
