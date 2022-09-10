
const { ApplicationCommandOptionType } = require('powercord/commands');
const { i18n: { Messages } } = require('powercord/webpack');

module.exports = {
  command: 'help',
  aliases: [ 'h' ],
  description: Messages.REPLUGGED_COMMAND_HELP_DESC,
  usage: '{c} [ commandName ]',
  options: [
    {
      name: 'command',
      displayName: 'command',
      description: 'The command to get information on.',
      displayDescription: 'The command to get information on.',
      type: ApplicationCommandOptionType.STRING,
      required: false,
      get choices () {
        const choices = [];

        powercord.api.commands.map(command => {
          choices.push({
            name: command.command,
            displayName: command.command,
            value: command.command
          });

          for (const alias of (command.aliases || [])) {
            choices.push({
              name: alias,
              displayName: alias,
              value: alias
            });
          }

          return command;
        });

        return choices.sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  ],
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
              commandOrigin: command.origin ?? 'Replugged'
            })
          }
        };
      }
    }

    return {
      send: false,
      result
    };
  }
};
