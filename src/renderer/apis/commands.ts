import type {
  RepluggedCommand,
  RepluggedCommandResult,
  RepluggedCommandSection,
} from "../../types";
import { Logger } from "../modules/logger";
import { channels, guilds, messages } from "../modules/common";
import { CommandOptionReturn } from "../../types/discord";
import users from "@common/users";
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

export class CommandInteraction {
  public options: CommandOptionReturn[];
  public constructor(args: CommandOptionReturn[]) {
    this.options = args;
  }

  public getValue<T>(name: string, defaultValue: T): T {
    return (this.options.find((o) => o.name === name)?.value as T) ?? defaultValue;
  }
}

/**
 * @internal
 * @hidden
 */
async function executeCommand(
  cmdExecutor:
    | ((
        interaction: CommandInteraction,
      ) => Promise<RepluggedCommandResult> | RepluggedCommandResult)
    | undefined,
  args: CommandOptionReturn[],
  command: RepluggedCommand,
): Promise<void> {
  try {
    const interaction = new CommandInteraction(args);
    const result = await cmdExecutor?.(interaction);
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

      Object.assign(botMessage, {
        interaction: {
          displayName: command.displayName,
          name: command.name,
          type: command.type,
          id: command.id,
          user: users.getCurrentUser(),
        },
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

    Object.assign(botMessage, {
      interaction: {
        displayName: command.displayName,
        name: command.name,
        type: command.type,
        id: command.id,
        user: users.getCurrentUser(),
      },
    });

    messages.receiveMessage(currentChannelId, botMessage);
  }
}

export class CommandManager {
  #section: RepluggedCommandSection;
  #unregister: Array<() => void>;
  public constructor() {
    this.#section = defaultSection;
    this.#section.type ??= 1;
    this.#unregister = [];
  }

  /**
   * Code to register an slash command
   * @param cmd Slash Command to be registered
   * @returns An Callback to unregister the slash command
   */
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
      await executeCommand(command.executor, args ?? [], command);
    };

    command.options?.map((option) => {
      option.displayName ??= option.name;
      option.displayDescription ??= option.description;
      return option;
    });

    currentSection?.commands.set(command.id, command);

    const uninject = (): void => {
      void currentSection?.commands.delete(command.id!);
      this.#unregister = this.#unregister.filter((u) => u !== uninject);
    };
    this.#unregister.push(uninject);
    return uninject;
  }
  /**
   * Code to unregister all slash commands registered with this class
   */
  public unregisterAllCommands(): void {
    for (const unregister of this.#unregister) unregister?.();
  }
}
