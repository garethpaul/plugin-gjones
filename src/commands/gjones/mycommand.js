const { Command } = require('@oclif/command');

class MyCommand extends Command {
  async run() {
    this.log('Hello World Test!');
  }
}

MyCommand.description = 'Print a simple plugin scaffold message';

module.exports = MyCommand;
