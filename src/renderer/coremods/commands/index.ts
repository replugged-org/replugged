import { type Store } from "@common/flux";
import type { Channel, Guild } from "discord-types/general";
import { RECELLED_CLYDE_ID } from "../../../constants";
import type { AnyReCelledCommand, ReCelledCommandSection } from "../../../types";
import { commandAndSections, defaultSection } from "../../apis/commands";
import { Injector } from "../../modules/injector";
import {
  filters,
  getByStoreName,
  getFunctionKeyBySource,
  waitForModule,
  waitForProps,
} from "../../modules/webpack";
import { loadCommands, unloadCommands } from "./commands";

const injector = new Injector();

interface QueryOptions {
  commandTypes: number[];
  applicationCommands?: boolean;
  text?: string;
  builtIns?: "allow" | "only_text" | "deny";
}

interface FetchOptions {
  applicationId?: string;
  allowFetch?: boolean;
  scoreMethod?: "none" | "application_only" | "command_only" | "command_or_application";
  allowEmptySections?: boolean;
  allowApplicationState?: boolean;
  sortOptions?: {
    applications?: { useFrecency: boolean; useScore: boolean };
    commands?: { useFrecency: boolean; useScore: boolean };
  };
  installOnDemand?: boolean;
  includeFrecency?: boolean;
}

interface ApplicationCommandIndex {
  descriptors: ReCelledCommandSection[];
  commands: AnyReCelledCommand[];
  sectionedCommands: Array<{ data: AnyReCelledCommand[]; section: ReCelledCommandSection }>;
  loading: boolean;
}

interface ApplicationCommandIndexStore extends Store {
  query: (
    channel: Channel,
    queryOptions: QueryOptions,
    fetchOptions: FetchOptions,
  ) => ApplicationCommandIndex;
}

type UseDiscoveryState = (
  channel: Channel,
  guild: Guild,
  queryOptions: QueryOptions,
  fetchOptions: FetchOptions,
) => ApplicationCommandIndex;

type FetchProfile = (id: string) => Promise<void>;

async function injectReCelledBotIcon(): Promise<void> {
  // Adds avatar for ReCelled to be used by system bot just like Clyde
  // Ain't removing it on stop because we have checks here
  const avatarUtilsMod = await waitForProps<{
    BOT_AVATARS: Record<string, string>;
  }>("BOT_AVATARS");
  avatarUtilsMod.BOT_AVATARS.recelled = defaultSection.icon;
}

async function injectReCelledSectionIcon(): Promise<void> {
  // Patches the function which gets icon URL for slash command sections
  // makes it return the custom url if it's our section
  const avatarUtilsMod = await waitForProps<{
    getApplicationIconURL: (args: { id: string; icon: string }) => string;
  }>("getApplicationIconURL");
  injector.after(avatarUtilsMod, "getApplicationIconURL", ([section], res) =>
    commandAndSections.has(section.id) ? commandAndSections.get(section.id)?.section.icon : res,
  );
}

async function injectApplicationCommandIndexStore(): Promise<void> {
  const applicationCommandIndexStoreMod = await waitForModule<Record<string, UseDiscoveryState>>(
    filters.bySource("APPLICATION_COMMAND_INDEX"),
  );
  const useDiscoveryStateKey = getFunctionKeyBySource(
    applicationCommandIndexStoreMod,
    "includeFrecency",
  )!;

  // Base handler function for ApplicationCommandIndexStore which is ran to get the info in store
  // commands are mainly added here
  injector.after(
    applicationCommandIndexStoreMod,
    useDiscoveryStateKey,
    ([, , { commandTypes }], res) => {
      const commandAndSectionsArray = Array.from(commandAndSections.values()).filter(
        (commandAndSection) => commandAndSection.commands.size,
      );
      if (!commandAndSectionsArray.length || !commandTypes.includes(1)) return res;
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

  const ApplicationCommandIndexStore = getByStoreName<ApplicationCommandIndexStore>(
    "ApplicationCommandIndexStore",
  )!;

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
      if (!commandAndSectionsArray.length) return res;

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
  const userActionCreatorsMod = await waitForModule<Record<string, FetchProfile>>(
    filters.bySource("fetchProfile"),
  );
  const fetchProfileKey = getFunctionKeyBySource(userActionCreatorsMod, "fetchProfile")!;

  injector.instead(userActionCreatorsMod, fetchProfileKey, (args, orig) => {
    if (args[0] === RECELLED_CLYDE_ID) return;
    return orig(...args);
  });
}

export async function start(): Promise<void> {
  await injectReCelledBotIcon();
  await injectReCelledSectionIcon();
  await injectApplicationCommandIndexStore();
  await injectProfileFetch();
  loadCommands();
}

export function stop(): void {
  injector.uninjectAll();
  unloadCommands();
}
