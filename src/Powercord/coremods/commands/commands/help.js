const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'help',
  aliases: [ 'h' ],
  description: Messages.REPLUGGED_COMMAND_HELP_DESC,
  usage: '{c} [ commandName ]',
  executor ([ commandName ]) {
    let result;

    if (!commandName) {
      const getPropLength = (command) => command.command.length;

      const longestCommandName = getPropLength(
        powercord.api.commands.sort((a, b) => getPropLength(b) - getPropLength(a))[0]
      );

      result = {
        type: 'rich',
        title: Messages.REPLUGGED_COMMAND_HELP_LIST_TITLE,
        description: powercord.api.commands
          .map(({ command, description }) =>
            `\`${command.padEnd((longestCommandName * 2) - command.length, ' \u200b')} |\` \u200b \u200b*${description}*`
          )
          .join('\n'),
        footer: {
          text: Messages.REPLUGGED_COMMAND_HELP_LIST_FOOTER.format({
            prefix: powercord.api.commands.prefix
          })
        }
      };
    } else {
      const command = powercord.api.commands.find(c => [ c.command, ...(c.aliases || []) ].includes(commandName));
      if (!command) {
        result = Messages.REPLUGGED_COMMAND_HELP_COMMAND_NOT_FOUND.format({
          commandName
        });
      } else {
        result = {
          type: 'rich',
          title: Messages.REPLUGGED_COMMAND_HELP_COMMAND_TITLE.format({
            commandName
          }),
          description: command.description,
          fields: [ {
            name: Messages.REPLUGGED_COMMAND_HELP_FIELD_USAGE,
            value: `\`${command.usage.replace('{c}', powercord.api.commands.prefix + command.command)}\n\``,
            inline: false
          } ],
          footer: {
            text: Messages.REPLUGGED_COMMAND_HELP_COMMAND_FOOTER.format({
              commandOrigin: command.origin
            })
          }
        };
      }
    }

    return {
      send: false,
      result
    };
  },
  autocomplete (args) {
    if (args.length > 1) {
      return false;
    }

    return {
      commands: powercord.api.commands.filter(command =>
        [ command.command, ...(command.aliases || []) ].some(commandName =>
          commandName.includes(args[0])
        )
      ),
      header: 'replugged command list'
    };
  }
};
