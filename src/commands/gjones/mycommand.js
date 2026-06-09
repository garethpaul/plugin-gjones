const { Command } = require('@oclif/command');

const OUTPUT_MESSAGE = 'Hello World Test!';

class MyCommand extends Command {
  async run() {
    this.log(OUTPUT_MESSAGE);
  }
}

MyCommand.description = 'Print a simple plugin scaffold message';

module.exports = MyCommand;
module.exports.OUTPUT_MESSAGE = OUTPUT_MESSAGE;
