const { Command } = module.parent.require('@oclif/core');

const OUTPUT_MESSAGE = 'Hello World Test!';

class MyCommand extends Command {
  async run() {
    if ((this.argv || []).length > 0) {
      this.error('This command does not accept arguments or flags.', { exit: 2 });
    }

    this.log(OUTPUT_MESSAGE);
  }
}

MyCommand.description = 'Print a simple plugin scaffold message';

module.exports = MyCommand;
Object.defineProperty(module.exports, 'OUTPUT_MESSAGE', {
  value: OUTPUT_MESSAGE,
  enumerable: true
});
