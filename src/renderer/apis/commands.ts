import type {
  RepluggedCommand,
  RepluggedCommandResult,
  RepluggedCommandSection,
} from "../../types";
import { Logger } from "../modules/logger";
import { channels, guilds, messages } from "../modules/common";
import { CommandOptionReturn } from "../../types/discord";
const logger = Logger.api("Commands");
interface CommandsAndSection {
  section: RepluggedCommandSection;
  commands: Map<string, RepluggedCommand>;
}

export const commandAndSections = new Map<string, CommandsAndSection>();

export const defaultSection: RepluggedCommandSection = Object.freeze({
  id: "replugged",
  name: "Replugged",
  type: 1,
  icon: "https://cdn.discordapp.com/attachments/1000955992068079716/1004196106055454820/Replugged-Logo.png",
});

async function executeCommand(
  cmdExecutor:
    | ((args: CommandOptionReturn[]) => Promise<RepluggedCommandResult> | RepluggedCommandResult)
    | undefined,
  args: CommandOptionReturn[],
): Promise<void> {
  try {
    const result = await cmdExecutor?.(args);
    const currentGuildId = guilds.getGuildId();
    const currentChannelId = channels.getChannelId(currentGuildId!)!;

    if ((!result?.result && !result?.embeds) || !currentChannelId) return;

    if (result.send) {
      void messages.sendMessage(currentChannelId, {
        content: result.result!,
        invalidEmojis: [],
        validNonShortcutEmojis: [],
        tts: false,
      });
    } else {
      const botMessage = messages.createBotMessage({
        channelId: currentChannelId,
        content: result.result || "",
        embeds: result.embeds || [],
        loggingName: "Replugged",
      });

      Object.assign(botMessage.author, {
        username: "Replugged",
        avatar: "replugged",
      });

      messages.receiveMessage(currentChannelId, botMessage);
    }
  } catch (error) {
    logger.error(error);
    const currentChannelId = channels.getLastSelectedChannelId()!;
    const botMessage = messages.createBotMessage?.({
      channelId: currentChannelId,
      content: `Something went wrong: ${error}`,
      embeds: [],
      loggingName: "Replugged",
    });
    if (!botMessage) return;

    Object.assign(botMessage.author, {
      username: "Replugged",
      avatar: "replugged",
    });

    messages.receiveMessage(currentChannelId, botMessage);
  }
}

export default class CommandManager {
  #section: RepluggedCommandSection;
  #unregistors: Array<() => void>;
  public constructor(props?: RepluggedCommandSection) {
    this.#section = props ?? defaultSection;
    this.#section.type ??= 1;
    this.#unregistors = [];
  }
  public registerCommand(command: RepluggedCommand): () => void {
    if (!commandAndSections.has(this.#section.id)) {
      commandAndSections.set(this.#section.id, {
        section: this.#section,
        commands: new Map<string, RepluggedCommand>(),
      });
    }
    const currentSection = commandAndSections.get(this.#section.id);
    command.applicationId = currentSection?.section.id;
    command.displayName ??= command.name;
    command.displayDescription ??= command.description;
    command.type = 1;
    command.id ??= command.name;

    command.execute ??= async (args) => {
      await executeCommand(command.executor, args ?? []);
    };

    command.options?.map((option) => {
      option.displayName ??= option.name;
      option.displayDescription ??= option.description;
      return option;
    });

    currentSection?.commands.set(command.id, command);
    const uninject = (): void => void currentSection?.commands.delete(command.id!);
    this.#unregistors.push(uninject);
    return uninject;
  }
  public unregisterAllCommands(): void {
    for (const unregister of this.#unregistors) unregister();
  }
}
