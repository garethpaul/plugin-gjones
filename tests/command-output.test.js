#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const COMMAND = path.join(ROOT, 'src/commands/gjones/mycommand.js');
const README = path.join(ROOT, 'README.md');
const EXPECTED_OUTPUT = 'Hello World Test!';

const source = fs.readFileSync(COMMAND, 'utf8');
const readme = fs.readFileSync(README, 'utf8');
const match = source.match(/this\.log\('([^']+)'\);/);

function loadCommand() {
  const sandbox = {
    module: { exports: {} },
    require(name) {
      if (name === '@oclif/command') {
        return { Command: class {} };
      }
      throw new Error(`unexpected require: ${name}`);
    }
  };
  sandbox.exports = sandbox.module.exports;

  vm.runInNewContext(source, sandbox, { filename: COMMAND });
  return sandbox.module.exports;
}

async function main() {
  assert(match, 'gjones:mycommand should log a literal scaffold message');
  assert.strictEqual(match[1], EXPECTED_OUTPUT);
  assert(
    readme.includes(EXPECTED_OUTPUT),
    'README should document the scaffold command output'
  );
  assert(
    !source.includes('Twilio' + 'ClientCommand'),
    'scaffold command should not require Twilio credentials'
  );

  const CommandClass = loadCommand();
  const command = Object.create(CommandClass.prototype);
  const lines = [];
  command.log = line => lines.push(line);

  await command.run();
  assert.deepStrictEqual(lines, [EXPECTED_OUTPUT]);

  console.log('command output check passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
