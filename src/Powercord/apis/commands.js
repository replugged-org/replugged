const { API } = require('powercord/entities');

/**
 * @typedef PowercordChatCommand
 * @property {String} command Command name
 * @property {String[]} aliases Command aliases
 * @property {String} description Command description
 * @property {String} usage Command usage
 * @property {Function} executor Command executor
 * @property {Function|undefined} autocomplete Autocompletion method
 */

/**
 * Replugged chat commands API
 * @property {Object.<String, PowercordChatCommand>} commands Registered commands
 */
class CommandsAPI extends API {
  constructor () {
    super();

    this.commands = {};
  }

  get prefix () {
    return powercord.settings.get('prefix', '.');
  }

  get find () {
    const arr = Object.values(this.commands);
    return arr.find.bind(arr);
  }

  get filter () {
    const arr = Object.values(this.commands);
    return arr.filter.bind(arr);
  }

  get map () {
    const arr = Object.values(this.commands);
    return arr.map.bind(arr);
  }

  get sort () {
    const arr = Object.values(this.commands);
    return arr.sort.bind(arr);
  }

  get size () {
    return Object.keys(this.commands).length;
  }

  /**
   * Registers a command
   * @param {PowercordChatCommand} command Command to register
   */
  registerCommand (command) {
    if (typeof command === 'string') {
      throw new Error(`Command “${command}” must be an object!`);
    }

    if (this.commands[command.command]) {
      throw new Error(`Command “${command.command}” is already registered!`);
    }

    this.commands[command.command] = command;

    this.emit('commandAdded', this.commands[command.command]);
  }

  /**
   * Unregisters a command
   * @param {String} command Command name to unregister
   */
  unregisterCommand (command) {
    if (this.commands[command]) {
      this.emit('commandRemoved', this.commands[command]);

      delete this.commands[command];
    } else {
      throw new Error(`Command “${command}” is not registered!`);
    }
  }
}

module.exports = CommandsAPI;
