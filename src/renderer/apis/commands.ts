import type { RepluggedCommand, RepluggedCommandResult } from "../../types";
import { Logger } from "../modules/logger";
import { channels, messages } from '../modules/common';

const commandsLogger = Logger.api("Commands");

async function executeCommand(cmdExecutor: (args: unknown) => Promise<RepluggedCommandResult>, args: unknown): Promise<void> {
  let result: RepluggedCommandResult;

  try {
    result = await cmdExecutor(args);
  } catch (err) {
    result = {
      send: false,
      result: "Something went wrong"
    }
  }

  if (!result?.result) return;

  if (result.send) {
    messages.sendMessage(channels.getChannelId(), {
      content: result.result,
      invalidEmojis: [],
      validNonShortcutEmojis: [],
      tts: false
    });
  } else {
    messages.sendBotMessage(channels.getChannelId(), result.result);
  }
}

export const section = {
  id: "replugged",
  name: "Replugged",
  type: 1,
  icon: "https://cdn.discordapp.com/attachments/1043690690330251335/1081935346457133167/8f6316fcbe578be33b39917b49431e63.webp",
};

/**
 * @internal
 * @hidden
 */
export const commands = new Map<string, RepluggedCommand>();

export function registerCommand(command: RepluggedCommand): void {
  if (commands.has(command.name)) {
    commandsLogger.error(`Command “${command.name}” is already registered!`);
    return;
  }

  command.applicationId = section.id;
  command.displayName ??= command.name;
  command.displayDescription ??= command.description;
  command.type = 1;
  command.id ??= command.name;
  
  command.execute ??= async (args) => {
    await executeCommand(command.executor, args ?? []);
  }
  
  if (command.options) {
    for (const option of command.options) {
      option.displayName ??= option.name;
      option.displayDescription ??= option.description;
    }
  }


  commands.set(command.name, command);
}

export function unregisterCommand(name: string): void {
  if (commands.has(name)) {
    commands.delete(name);
  } else {
    commandsLogger.error(`Command “${name}” is not registered!`);
  }
}

