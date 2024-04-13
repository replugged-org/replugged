import type { Channel, Guild, User } from "discord-types/general";
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
// eslint-disable-next-line no-duplicate-imports
import { ApplicationCommandOptionType } from "../../types";
import { constants, i18n, messages, users } from "../modules/common";
import type { Store } from "../modules/common/flux";
import { Logger } from "../modules/logger";
import { filters, getByStoreName, waitForModule } from "../modules/webpack";
import icon from "../assets/logo.png";
const logger = Logger.api("Commands");

let RepluggedUser: User | undefined;

interface CommandsAndSection {
  section: RepluggedCommandSection;
  commands: Map<string, AnyRepluggedCommand>;
}

void waitForModule<typeof User>(filters.bySource(".isStaffPersonal=")).then((User) => {
  RepluggedUser = new User({
    avatar: "replugged",
    id: "replugged",
    bot: true,
    username: "Replugged",
    system: true,
  });
});

export const commandAndSections = new Map<string, CommandsAndSection>();

export const defaultSection: RepluggedCommandSection = Object.freeze({
  id: "replugged",
  name: "Replugged",
  type: 1,
  icon,
});

export class CommandInteraction<T extends CommandOptionReturn> {
  public options: T[];
  public channel: Channel;
  public guild: Guild;
  public constructor(props: { options: T[]; channel: Channel; guild: Guild }) {
    const UploadAttachmentStore = getByStoreName<
      Store & {
        getUpload: (
          channelId: string,
          optionName: string,
          draftType: 0,
        ) => { uploadedFilename?: string; item?: { file: File } } | undefined;
      }
    >("UploadAttachmentStore")!;
    this.options = props.options;
    this.channel = props.channel;
    this.guild = props.guild;
    for (const option of this.options.filter(
      (o) => o.type === ApplicationCommandOptionType.Attachment,
    )) {
      const { uploadedFilename, item } =
        UploadAttachmentStore.getUpload(props.channel.id, option.name, 0) ?? {};
      option.value = { uploadedFilename, file: item?.file };
    }
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
      content: "",
      loggingName: "Replugged",
    });

    Object.assign(loadingMessage, {
      flags: constants.MessageFlags.EPHEMERAL + constants.MessageFlags.LOADING, // adding loading too
      state: "SENDING", // Keep it a little faded
      interaction: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        name_localized: command.displayName,
        name: command.name,
        type: command.type,
        id: command.id,
        user: users.getCurrentUser(),
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      interaction_data: {
        name: command.displayName,
      },
      type: 20,
      author: RepluggedUser ?? loadingMessage.author,
    });
    messages.receiveMessage(currentChannelId, loadingMessage, true);
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

      Object.assign(botMessage, {
        interaction: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          name_localized: command.displayName,
          name: command.name,
          type: command.type,
          id: command.id,
          user: users.getCurrentUser(),
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interaction_data: {
          name: command.displayName,
        },
        type: 20,
        author: RepluggedUser ?? botMessage.author,
      });
      messages.receiveMessage(currentChannelId, botMessage, true);
    }
  } catch (error) {
    logger.error(error);
    const currentChannelId = currentInfo.channel.id;
    const botMessage = messages.createBotMessage({
      channelId: currentChannelId,
      content: i18n.Messages.REPLUGGED_COMMAND_ERROR_GENERIC,
      embeds: [],
      loggingName: "Replugged",
    });

    Object.assign(botMessage, {
      interaction: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        name_localized: command.displayName,
        name: command.name,
        type: command.type,
        id: command.id,
        user: users.getCurrentUser(),
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      interaction_data: {
        name: command.displayName,
      },
      type: 20,
      author: RepluggedUser ?? botMessage.author,
    });

    messages.receiveMessage(currentChannelId, botMessage, true);
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
      void executeCommand(command.executor, args, currentInfo, command);
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
    for (const unregister of this.#unregister) unregister();
  }
}
