const { ApplicationCommandType, ApplicationCommandInputType, ApplicationCommandOptionType, COMMAND_SECTION } = require('powercord/commands');
const { messages, channels, getModule } = require('powercord/webpack');
const { inject } = require('powercord/injector');

const commands = require('./commands');

const { BOT_AVATARS } = getModule([ 'BOT_AVATARS' ], false);
const { createBotMessage } = getModule([ 'createBotMessage' ], false);

module.exports = {
  __$$InjectionCache: { ids: [] },

  loadDefaultCommands () {
    for (const command of Object.values(commands)) {
      powercord.api.commands.registerCommand(command);
    }
  },

  unloadDefaultCommands () {
    for (const command of Object.values(commands)) {
      powercord.api.commands.unregisterCommand(command.command);
    }
  },

  parseCommand (command) {
    const { command: name, executor, ...props } = command;

    const defaultOptions = {
      applicationId: COMMAND_SECTION.id,
      displayName: name,
      displayDescription: props.description,
      __$$Powercord: true
    };

    return {
      type: ApplicationCommandType.CHAT,
      id: name,
      inputType: ApplicationCommandInputType.BUILT_IN,
      name,
      description: command.description,
      options: [
        props.options && { ...props.options.reduce((options, option) => {
          option.displayName = option.displayName ?? option.name;
          option.displayDescription = option.displayDescription ?? option.description;

          if (typeof option.type === 'string') {
            option.type = ApplicationCommandOptionType[option.type.toUpperCase()];
          }

          options.push(option);

          return options;
        }, []) },
        !props.options && props.usage !== '{c}' && {
          type: ApplicationCommandOptionType.STRING,
          name: 'arguments',
          displayName: 'arguments',
          description: `Usage: ${props.usage?.replace?.(/{c}/g, name) ?? name}`,
          displayDescription: `Usage: ${props.usage?.replace?.(/{c}/g, name) ?? name}`,
          required: false
        }
      ].filter(Boolean),
      ...props,
      ...defaultOptions,
      execute: (result) => {
        try {
          let args;

          if (props.useNamedSlashArguments) {
            args = Object.values(result).reduce((results, res) => {
              results[res.name] = res.value;

              return results;
            }, {});
          } else {
            args = Object.values(result).map(res => res.value);
          }

          this.executeCommand(executor, args ?? []);
        } catch (e) {
          this.error(`An error occurred while executing command ${name}: ${e}`);
        }
      }
    };
  },

  async executeCommand (fn, args) {
    let result;

    try {
      result = await fn(args);
    } catch (e) {
      result = {
        send: false,
        result: `An error occurred while executing the command: ${e.message}.\nCheck the console for more details.`
      };
      console.error(args, e);
    }

    if (!result || !result.result) {
      return;
    }

    if (result.send) {
      messages.sendMessage(channels.getChannelId(), {
        content: result.result,
        invalidEmojis: [],
        validNonShortcutEmojis: [],
        tts: false
      });
    } else {
      const receivedMessage = createBotMessage({
        channelId: channels.getChannelId(),
        content: ''
      });

      if (powercord.settings.get('replaceClyde', true)) {
        receivedMessage.author.username = result.username || 'Replugged';
        receivedMessage.author.avatar = 'replugged';

        if (result.avatar_url) {
          BOT_AVATARS[result.username] = result.avatar_url;

          receivedMessage.author.avatar = result.username;
        }
      }

      if (typeof result.result === 'string') {
        receivedMessage.content = result.result;
      } else {
        receivedMessage.embeds.push(result.result);
      }

      return (messages.receiveMessage(channels.getChannelId(), receivedMessage), delete BOT_AVATARS[result.avatar_url]);
    }
  },

  addCommand (command) {
    powercord.api.commands.$$commands ??= {};
    powercord.api.commands.$$commands[command.command] = this.parseCommand(command);
  },

  removeCommand (command) {
    delete powercord.api.commands.$$commands[command.command];
  },

  inject (id, ...args) {
    this.__$$InjectionCache.ids.push(id);

    inject(id, ...args);
  },

  error (...data) {
    console.error('%c[Replugged:Plugin:Commands]', 'color: #f04747;', ...data);
  }
};
