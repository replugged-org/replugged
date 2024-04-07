import type { AnyRepluggedCommand, RepluggedCommandSection } from "../../../types";
import type { Channel, Guild } from "discord-types/general";
import type { Store } from "@common/flux";
import { Injector } from "../../modules/injector";
import { Logger } from "../../modules/logger";
import { waitForProps } from "../../modules/webpack";

import { commandAndSections, defaultSection } from "../../apis/commands";
import { loadCommands, unloadCommands } from "./commands";

const logger = Logger.api("Commands");
const injector = new Injector();

type CommandState =
  | {
      fetchState: { fetching: boolean };
      result: {
        sectionIdsByBotId: Record<string, string>;
        sections: Record<
          string,
          { commands: Record<string, AnyRepluggedCommand>; descriptor: RepluggedCommandSection }
        >;
        version: string;
      };
      serverVersion: symbol | string;
    }
  | undefined;

interface ApplicationCommandIndexStore extends Store {
  getContextState: (channel: Channel) => CommandState;
  getUserState: () => CommandState;
  query: (
    channel: Channel,
    queryOptions: {
      commandType: number;
      text: string;
    },
    fetchOptions: {
      allowFetch: boolean;
      limit: number;
      includeFrecency?: boolean;
      placeholderCount?: number;
      scoreMethod?: string;
    },
  ) =>
    | {
        descriptors: RepluggedCommandSection[];
        commands: AnyRepluggedCommand[];
        sectionedCommands: Array<{ data: AnyRepluggedCommand[]; section: RepluggedCommandSection }>;
        loading: boolean;
      }
    | undefined;
}

interface ApplicationCommandIndexStoreMod {
  useContextIndexState: (
    channel: Channel,
    allowCache: boolean,
    allowFetch: boolean,
  ) => CommandState;
  useDiscoveryState: (
    channel: Channel,
    guild: Guild,
    commandOptions: {
      commandType: number;
      applicationCommands?: boolean;
      builtIns?: "allow" | "deny";
    },
    fetchOptions: {
      allowFetch: boolean;
      limit: number;
      includeFrecency?: boolean;
      placeholderCount?: number;
      scoreMethod?: string;
    },
  ) =>
    | {
        descriptors: RepluggedCommandSection[];
        commands: AnyRepluggedCommand[];
        loading: boolean;
        sectionedCommands: Array<{ data: AnyRepluggedCommand[]; section: RepluggedCommandSection }>;
      }
    | undefined;
  useGuildIndexState: (guildId: string, allowFetch: boolean) => CommandState;
  useUserIndexState: (allowCache: boolean, allowFetch: boolean) => CommandState;
  default: ApplicationCommandIndexStore;
}

async function injectRepluggedBotIcon(): Promise<void> {
  // Adds Avatar for replugged to default avatar to be used by system bot just like clyde
  // Ain't removing it on stop because we have checks here
  const DefaultAvatars = await waitForProps<{
    BOT_AVATARS: Record<string, string> | undefined;
  }>("BOT_AVATARS");
  if (DefaultAvatars.BOT_AVATARS) {
    DefaultAvatars.BOT_AVATARS.replugged = defaultSection.icon;
  } else {
    logger.error("Error while injecting custom icon for slash command replies.");
  }
}

async function injectRepluggedSectionIcon(): Promise<void> {
  // Patches the function which gets icon URL for slash command sections
  // makes it return the custom url if it's our section
  const AssetsUtils = await waitForProps<{
    getApplicationIconURL: (args: { id: string; icon: string }) => string;
  }>("getApplicationIconURL");
  injector.after(AssetsUtils, "getApplicationIconURL", ([section], res) =>
    commandAndSections.has(section.id) ? commandAndSections.get(section.id)?.section.icon : res,
  );
}

async function injectApplicationCommandIndexStore(): Promise<void> {
  // The module which contains the store
  const ApplicationCommandIndexStoreMod = await waitForProps<ApplicationCommandIndexStoreMod>(
    "useContextIndexState",
    "useDiscoveryState",
    "useGuildIndexState",
    "useUserIndexState",
  );

  // Base handler function for ApplicationCommandIndexStore which is ran to get the info in store
  // commands are mainly added here
  injector.after(
    ApplicationCommandIndexStoreMod,
    "useDiscoveryState",
    ([, , { commandType }], res) => {
      const commandAndSectionsArray = Array.from(commandAndSections.values()).filter(
        (commandAndSection) => commandAndSection.commands.size,
      );
      if (!res || !commandAndSectionsArray.length || commandType !== 1) return res;
      if (
        !Array.isArray(res.descriptors) ||
        !commandAndSectionsArray.every((commandAndSection) =>
          res.descriptors.some((section) => section.id === commandAndSection.section.id),
        )
      ) {
        const sectionsToAdd = commandAndSectionsArray
          .map((commandAndSection) => commandAndSection.section)
          .filter((section) => !res.descriptors.includes(section));
        if (res.descriptors.some((section) => section.id === "-2")) {
          res.descriptors.splice(1, 0, ...sectionsToAdd);
        } else {
          res.descriptors = Array.isArray(res.descriptors)
            ? [...sectionsToAdd, ...res.descriptors]
            : sectionsToAdd;
        }
      }
      if (
        !Array.isArray(res.commands) ||
        commandAndSectionsArray.some((commandAndSection) =>
          Array.from(commandAndSection.commands.values()).some(
            (command) => !res.commands.includes(command),
          ),
        )
      ) {
        const commandsToAdd = commandAndSectionsArray
          .map((commandAndSection) => Array.from(commandAndSection.commands.values()))
          .flat(10);
        const indexAt = res.commands.findIndex(
          (c) =>
            c.id === res.sectionedCommands.find(({ section }) => section.id === "-2")?.data[0].id,
        );
        if (indexAt) {
          res.commands.splice(indexAt, 0, ...commandsToAdd);
        } else {
          res.commands = Array.isArray(res.commands)
            ? [
                ...commandsToAdd,
                ...res.commands.filter((command) => !commandsToAdd.includes(command)),
              ]
            : commandsToAdd;
        }
      }

      if (
        !Array.isArray(res.sectionedCommands) ||
        !commandAndSectionsArray.every((commandAndSection) =>
          res.sectionedCommands.some(({ section }) => section.id === commandAndSection.section.id),
        )
      ) {
        const dataToAdd = commandAndSectionsArray.map((commandAndSection) => ({
          section: commandAndSection.section,
          data: Array.from(commandAndSection.commands.values()),
        }));
        if (res.sectionedCommands.some(({ section }) => section.id === "-2")) {
          res.sectionedCommands.splice(1, 0, ...dataToAdd);
        } else {
          res.sectionedCommands = Array.isArray(res.sectionedCommands)
            ? [...dataToAdd, ...res.sectionedCommands]
            : dataToAdd;
        }
      }
      return res;
    },
  );

  // The store itself
  const ApplicationCommandIndexStore = ApplicationCommandIndexStoreMod.default;

  // Slash command indexing patched to return our slash commands too
  // only those which match tho
  injector.after(
    ApplicationCommandIndexStore,
    "query",
    ([_, { text: query }]: [unknown, { text?: string }], res) => {
      if (!query || query.startsWith("/")) return res;

      const commandAndSectionsArray = Array.from(commandAndSections.values())
        .map((commandAndSection) => ({
          section: commandAndSection.section,
          commands: Array.from(commandAndSection.commands.values()).filter((c) =>
            c.name.includes(query),
          ),
        }))
        .filter((commandAndSection) => commandAndSection.commands.length);
      if (!res || !commandAndSectionsArray.length) return res;

      if (
        !Array.isArray(res.descriptors) ||
        !commandAndSectionsArray.every((commandAndSection) =>
          res.descriptors.some((section) => section.id === commandAndSection.section.id),
        )
      ) {
        const sectionsToAdd = commandAndSectionsArray.map(
          (commandAndSection) => commandAndSection.section,
        );
        res.descriptors = Array.isArray(res.commands)
          ? [...sectionsToAdd, ...res.descriptors]
          : sectionsToAdd;
      }
      if (
        !Array.isArray(res.commands) ||
        commandAndSectionsArray.some((commandAndSection) =>
          Array.from(commandAndSection.commands).some((command) => !res.commands.includes(command)),
        )
      ) {
        const commandsToAdd = commandAndSectionsArray
          .map((commandAndSection) => commandAndSection.commands)
          .flat(10);
        res.commands = Array.isArray(res.commands)
          ? [
              ...commandsToAdd,
              ...res.commands.filter((command) => !commandsToAdd.includes(command)),
            ]
          : commandsToAdd;
      }

      if (
        !Array.isArray(res.sectionedCommands) ||
        !commandAndSectionsArray.every((commandAndSection) =>
          res.sectionedCommands.some(({ section }) => section.id === commandAndSection.section.id),
        )
      ) {
        const dataToAdd = commandAndSectionsArray.map((commandAndSection) => ({
          section: commandAndSection.section,
          data: commandAndSection.commands,
        }));
        res.sectionedCommands = Array.isArray(res.sectionedCommands)
          ? [...dataToAdd, ...res.sectionedCommands]
          : dataToAdd;
      }
      return res;
    },
  );
}

async function injectProfileFetch(): Promise<void> {
  const mod = await waitForProps<{
    fetchProfile: (id: string) => Promise<void>;
  }>("fetchProfile");
  injector.instead(mod, "fetchProfile", (args, res) => {
    if (args[0] === "replugged") {
      return;
    }
    return res(...args);
  });
}
export async function start(): Promise<void> {
  await injectRepluggedBotIcon();
  await injectRepluggedSectionIcon();
  await injectApplicationCommandIndexStore();
  await injectProfileFetch();
  loadCommands();
}
export function stop(): void {
  injector.uninjectAll();
  unloadCommands();
}
