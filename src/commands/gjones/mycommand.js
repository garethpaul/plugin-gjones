const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

class myCommand extends TwilioClientCommand {
  async run() {
    console.log('Hello World Test!');
  }
}

myCommand.description =
  "This is my first command... and doesn't do anything special";

module.exports = myCommand;