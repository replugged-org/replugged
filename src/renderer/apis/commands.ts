import API from '../entities/api';
import { RepluggedCommand } from '../../types';

class CommandsAPI extends API {
  commands = new Map<string, RepluggedCommand>();

  constructor () {
    super('Commands');
  }

  get find () {
    const arr = [ ...this.commands.values() ];
    return arr.find.bind(arr);
  }

  get filter () {
    const arr = [ ...this.commands.values() ];
    return arr.filter.bind(arr);
  }

  get map () {
    const arr = [ ...this.commands.values() ];
    return arr.map.bind(arr);
  }

  get sort () {
    const arr = [ ...this.commands.values() ];
    return arr.sort.bind(arr);
  }

  get size (): number {
    return [ ...this.commands.keys() ].length;
  }

  registerCommand (command: RepluggedCommand): void {
    if (this.commands.has(command.name)) {
      this.error(`Command “${command.name}” is already registered!`);
      return;
    }

    this.commands.set(command.name, command);
    this.dispatchEvent(new CustomEvent('rpCommandAdded', { detail: { command } }));
  }

  unregisterCommand (name: string): void {
    if (this.commands.has(name)) {
      this.dispatchEvent(new CustomEvent('rpCommandRemoved', { detail: { command: this.commands.get(name) } }));
      this.commands.delete(name);
    } else {
      this.error(`Command “${name}” is not registered!`);
    }
  }
}

export default new CommandsAPI();
