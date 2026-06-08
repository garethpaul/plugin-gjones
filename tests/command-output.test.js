#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMMAND = path.join(ROOT, 'src/commands/gjones/mycommand.js');
const README = path.join(ROOT, 'README.md');

const source = fs.readFileSync(COMMAND, 'utf8');
const readme = fs.readFileSync(README, 'utf8');
const match = source.match(/this\.log\('([^']+)'\);/);

assert(match, 'gjones:mycommand should log a literal scaffold message');
assert.strictEqual(match[1], 'Hello World Test!');
assert(
  readme.includes('Hello World Test!'),
  'README should document the scaffold command output'
);
assert(
  !source.includes('Twilio' + 'ClientCommand'),
  'scaffold command should not require Twilio credentials'
);

console.log('command output check passed.');
