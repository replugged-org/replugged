const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'echo',
  description: Messages.REPLUGGED_COMMAND_ECHO_DESC,
  usage: '{c} [ ...arguments ]',
  executor: (args) => ({
    send: false,
    result: args.join(' ')
  })
};
