import type { RepluggedCommand } from "../../types";
import { Logger } from "../modules/logger";

const commandsLogger = Logger.api("Commands");

class CommandsAPI extends EventTarget {
  public commands = new Map<string, RepluggedCommand>();

  public registerCommand(command: RepluggedCommand): void {
    if (this.commands.has(command.name)) {
      commandsLogger.error(`Command “${command.name}” is already registered!`);
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
      commandsLogger.error(`Command “${name}” is not registered!`);
    }
  }
}

export default new CommandsAPI();
