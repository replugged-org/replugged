import type {
  AnyRepluggedCommand,
  CommandOptionReturn,
  CommandOptions,
  GetCommandOption,
  GetCommandOptions,
  GetValueType,
  RepluggedCommand,
  RepluggedCommandResult,
  RepluggedCommandSection,
} from "../../types";
import type { Channel, Guild } from "discord-types/general";
import { Logger } from "../modules/logger";
import { channels, messages, users } from "../modules/common";
const logger = Logger.api("Commands");

interface CommandsAndSection {
  section: RepluggedCommandSection;
  commands: Map<string, AnyRepluggedCommand>;
}

export const commandAndSections = new Map<string, CommandsAndSection>();

export const defaultSection: RepluggedCommandSection = Object.freeze({
  id: "replugged",
  name: "Replugged",
  type: 1,
  icon: "https://cdn.discordapp.com/attachments/1000955992068079716/1004196106055454820/Replugged-Logo.png",
});

export class CommandInteraction<T extends CommandOptionReturn> {
  public options: T[];
  public channel: Channel;
  public guild: Guild;
  public constructor(props: { options: T[]; channel: Channel; guild: Guild }) {
    this.options = props.options;
    this.channel = props.channel;
    this.guild = props.guild;
  }

  public getValue<K extends T["name"], D = undefined>(
    name: K,
    defaultValue?: D,
  ): GetValueType<GetCommandOption<T, K>, D> {
    return (this.options.find((o) => o.name === name)?.value ?? defaultValue) as GetValueType<
      GetCommandOption<T, K>,
      D
    >;
  }
}

/**
 * @internal
 * @hidden
 */
async function executeCommand<T extends CommandOptions>(
  cmdExecutor:
    | ((
        interaction: CommandInteraction<GetCommandOptions<T>>,
      ) => Promise<RepluggedCommandResult> | RepluggedCommandResult)
    | undefined,
  args: Array<GetCommandOptions<T>>,
  currentInfo: { guild: Guild; channel: Channel },
  command: RepluggedCommand<T>,
): Promise<void> {
  try {
    const currentChannelId = currentInfo.channel.id;
    const loadingMessage = messages.createBotMessage({
      channelId: currentChannelId,
      content: "Executing Command, Please Wait...",
      loggingName: "Replugged",
    });

    Object.assign(loadingMessage.author, {
      username: "Replugged",
      avatar: "replugged",
    });

    Object.assign(loadingMessage, {
      interaction: {
        displayName: command.displayName,
        name: command.name,
        type: command.type,
        id: command.id,
        user: users.getCurrentUser(),
      },
    });
    messages.receiveMessage(currentChannelId, loadingMessage);
    const interaction = new CommandInteraction({ options: args, ...currentInfo });
    const result = await cmdExecutor?.(interaction);
    messages.dismissAutomatedMessage(loadingMessage);

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
  public registerCommand<const T extends CommandOptions>(command: RepluggedCommand<T>): () => void {
    if (!commandAndSections.has(this.#section.id)) {
      commandAndSections.set(this.#section.id, {
        section: this.#section,
        commands: new Map<string, AnyRepluggedCommand>(),
      });
    }
    const currentSection = commandAndSections.get(this.#section.id);
    command.applicationId = currentSection?.section.id;
    command.displayName ??= command.name;
    command.displayDescription ??= command.description;
    command.type = 2;
    command.id ??= command.name;

    command.execute ??= (args, currentInfo) => {
      void executeCommand(command.executor, args ?? [], currentInfo ?? {}, command);
    };

    command.options?.map((option) => {
      option.serverLocalizedName ??= option.displayName;
      option.displayName ??= option.name;
      option.displayDescription ??= option.description;

      return option;
    });

    currentSection?.commands.set(command.id, command as AnyRepluggedCommand);

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
