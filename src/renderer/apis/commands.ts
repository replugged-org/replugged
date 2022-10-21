import API from "../entities/api";
import { RepluggedCommand } from "../../types";

class CommandsAPI extends API {
  public commands = new Map<string, RepluggedCommand>();

  public constructor() {
    super("dev.replugged.apis.Commands", "Commands");
  }

  public get find(): typeof Array.prototype.find {
    const arr = [...this.commands.values()];
    return arr.find.bind(arr);
  }

  public get filter(): typeof Array.prototype.filter {
    const arr = [...this.commands.values()];
    return arr.filter.bind(arr);
  }

  public get map(): typeof Array.prototype.map {
    const arr = [...this.commands.values()];
    return arr.map.bind(arr);
  }

  public get sort(): typeof Array.prototype.sort {
    const arr = [...this.commands.values()];
    return arr.sort.bind(arr);
  }

  public get size(): number {
    return [...this.commands.keys()].length;
  }

  public registerCommand(command: RepluggedCommand): void {
    if (this.commands.has(command.name)) {
      this.error(`Command “${command.name}” is already registered!`);
      return;
    }

    this.commands.set(command.name, command);
    this.dispatchEvent(new CustomEvent("rpCommandAdded", { detail: { command } }));
  }

  public unregisterCommand(name: string): void {
    if (this.commands.has(name)) {
      this.dispatchEvent(
        new CustomEvent("rpCommandRemoved", { detail: { command: this.commands.get(name) } }),
      );
      this.commands.delete(name);
    } else {
      this.error(`Command “${name}” is not registered!`);
    }
  }
}

export default new CommandsAPI();
