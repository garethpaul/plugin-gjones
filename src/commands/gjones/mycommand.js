const { Command } = require('@oclif/core');

const OUTPUT_MESSAGE = 'Hello World Test!';

class MyCommand extends Command {
  async run() {
    this.log(OUTPUT_MESSAGE);
  }
}

MyCommand.description = 'Print a simple plugin scaffold message';

module.exports = MyCommand;
Object.defineProperty(module.exports, 'OUTPUT_MESSAGE', {
  value: OUTPUT_MESSAGE,
  enumerable: true
});
