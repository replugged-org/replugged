import API from './api';
import { RepluggedCommand } from '../../types';

export default class CommandsAPI extends API {
  commands: {
    [name: string]: RepluggedCommand
  } = {};

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

  get size (): number {
    return Object.keys(this.commands).length;
  }

  registerCommand (command: RepluggedCommand): void {
    if (this.commands[command.name]) {
      this.error(`Command “${command.name}” is already registered!`);
      return;
    }

    this.commands[command.name] = command;
    this.dispatchEvent(new CustomEvent('rpCommandAdded', { detail: { name: this.commands[command.name] } }));
  }

  unregisterCommand (name: string): void {
    if (this.commands[name]) {
      this.dispatchEvent(new CustomEvent('rpCommandRemoved', { detail: { name: this.commands[name] } }));
      delete this.commands[name];
    } else {
      this.error(`Command “${name}” is not registered!`);
    }
  }
}
