const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'say',
  description: Messages.REPLUGGED_COMMAND_SAY_DESC,
  usage: '{c} [ ...arguments ]',
  showTyping: true,
  executor: (args) => ({
    send: true,
    result: args.join(' ')
  })
};
