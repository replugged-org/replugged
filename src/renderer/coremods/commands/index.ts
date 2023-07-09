import { Injector } from "../../modules/injector";
import { Logger } from "../../modules/logger";
import {
  filters,
  getExportsForProps,
  getFunctionKeyBySource,
  waitForModule,
  waitForProps,
} from "../../modules/webpack";
import { RepluggedCommand, RepluggedCommandSection } from "../../../types";

import { commandAndSections, defaultSection } from "../../apis/commands";
import { loadCommands, unloadCommands } from "./commands";
const logger = Logger.api("Commands");
const injector = new Injector();

interface ApplicationCommandSearchStoreMod {
  [key: string]: (...args: unknown[]) => {
    sectionDescriptors: RepluggedCommandSection[];
    commands: RepluggedCommand[];
    filteredSectionId: string;
    activeSections: RepluggedCommandSection[];
    commandsByActiveSection: Array<{
      section: RepluggedCommandSection;
      data: RepluggedCommand[];
    }>;
  };
}

interface ApplicationCommandSearchStore {
  getChannelState: (...args: unknown[]) => {
    applicationSections: RepluggedCommandSection[];
    applicationCommands: RepluggedCommand[];
  };
  getApplicationSections: (...args: unknown[]) => RepluggedCommandSection[];
  useSearchManager: (...args: unknown[]) => unknown;
  getQueryCommands: (...args: [string, string, string]) => RepluggedCommand[];
}

async function injectRepluggedBotIcon(): Promise<void> {
  const DefaultAvatars = await waitForProps<{
    BOT_AVATARS: Record<string, string>;
  }>("BOT_AVATARS");
  if (DefaultAvatars?.BOT_AVATARS) {
    DefaultAvatars.BOT_AVATARS.replugged = defaultSection.icon;
  } else {
    logger.error("Error while injecting custom icon for slash command replies.");
  }
}

async function injectRepluggedSectionIcon(): Promise<void> {
  const AssetsUtils = await waitForProps<{
    getApplicationIconURL: (args: { id: string; icon: string }) => string;
  }>("getApplicationIconURL");
  injector.after(AssetsUtils, "getApplicationIconURL", ([section], res) =>
    commandAndSections.has(section.id) ? commandAndSections.get(section.id)?.section.icon : res,
  );
}

async function injectApplicationCommandSearchStore(): Promise<void> {
  const ApplicationCommandSearchStoreMod = await waitForModule<ApplicationCommandSearchStoreMod>(
    filters.bySource("ApplicationCommandSearchStore"),
  );
  const storeModFnKey = getFunctionKeyBySource(
    ApplicationCommandSearchStoreMod,
    "APPLICATION_COMMAND_SEARCH_OPEN_TIMING",
  );
  injector.after(ApplicationCommandSearchStoreMod, storeModFnKey!, (_, res) => {
    const commandAndSectionsArray = Array.from(commandAndSections.values()).filter(
      (commandAndSection) => commandAndSection.commands.size,
    );
    if (!res || !commandAndSectionsArray.length) return res;
    if (
      !Array.isArray(res.sectionDescriptors) ||
      !commandAndSectionsArray.every((commandAndSection) =>
        res.sectionDescriptors.some((section) => section.id === commandAndSection.section.id),
      )
    ) {
      const sectionsToAdd = commandAndSectionsArray
        .map((commandAndSection) => commandAndSection.section)
        .filter((section) => !res.sectionDescriptors.includes(section));
      if (res.sectionDescriptors.some?.((section) => section?.id === "-2")) {
        res.sectionDescriptors.splice(1, 0, ...sectionsToAdd);
      } else {
        res.sectionDescriptors = Array.isArray(res.sectionDescriptors)
          ? [...sectionsToAdd, ...res.sectionDescriptors]
          : sectionsToAdd;
      }
    }
    if (
      res.filteredSectionId === null ||
      commandAndSectionsArray.some(
        (commandAndSection) => res.filteredSectionId === commandAndSection.section.id,
      )
    ) {
      const sectionsToAdd = commandAndSectionsArray
        .map((commandAndSection) => commandAndSection.section)
        .filter(
          (section) =>
            (res.filteredSectionId == null || res.filteredSectionId === section.id) &&
            !res.activeSections.includes(section),
        );
      if (res.activeSections.some?.((section) => section?.id === "-2")) {
        res.activeSections.splice(1, 0, ...sectionsToAdd);
      } else {
        res.activeSections = Array.isArray(res.activeSections)
          ? [...sectionsToAdd, ...res.activeSections]
          : sectionsToAdd;
      }

      const commandsBySectionToAdd = commandAndSectionsArray
        .filter(
          (commandAndSection) =>
            (res.filteredSectionId !== null
              ? res.filteredSectionId === commandAndSection.section.id
              : true) &&
            !res.commandsByActiveSection.some(
              (activeCommandAndSection) =>
                activeCommandAndSection.section.id === commandAndSection.section.id,
            ),
        )
        .map((commandAndSection) => ({
          section: commandAndSection.section,
          data: Array.from(commandAndSection.commands.values()),
        }));

      if (
        res.commandsByActiveSection.some?.(
          (activeCommandAndSections) => activeCommandAndSections?.section?.id === "-2",
        )
      ) {
        res.commandsByActiveSection.splice(1, 0, ...commandsBySectionToAdd);
      } else {
        res.commandsByActiveSection = Array.isArray(res.commandsByActiveSection)
          ? [...commandsBySectionToAdd, ...res.commandsByActiveSection]
          : commandsBySectionToAdd;
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
      res.commands = Array.isArray(res.commands)
        ? [...res.commands.filter((command) => !commandsToAdd.includes(command)), ...commandsToAdd]
        : commandsToAdd;
    }
    return res;
  });

  const ApplicationCommandSearchStore = getExportsForProps<ApplicationCommandSearchStore>(
    ApplicationCommandSearchStoreMod,
    ["getApplicationSections", "getChannelState", "getQueryCommands"],
  )!;

  injector.after(ApplicationCommandSearchStore, "getChannelState", (_, res) => {
    const commandAndSectionsArray = Array.from(commandAndSections.values()).filter(
      (commandAndSection) => commandAndSection.commands.size,
    );
    if (!res || !commandAndSectionsArray.length) return res;
    if (
      !Array.isArray(res.applicationSections) ||
      !commandAndSectionsArray.every((commandAndSection) =>
        res.applicationSections?.some((section) => section.id === commandAndSection.section.id),
      )
    ) {
      const sectionsToAdd = commandAndSectionsArray.map(
        (commandAndSection) => commandAndSection.section,
      );
      res.applicationSections = Array.isArray(res.applicationSections)
        ? [...sectionsToAdd, ...res.applicationSections]
        : sectionsToAdd;
    }
    if (
      !Array.isArray(res.applicationCommands) ||
      commandAndSectionsArray.some((commandAndSection) =>
        Array.from(commandAndSection.commands.values()).some(
          (command) => !res.applicationCommands.includes(command),
        ),
      )
    ) {
      const commandsToAdd = commandAndSectionsArray
        .map((commandAndSection) => Array.from(commandAndSection.commands.values()))
        .flat(10);
      res.applicationCommands = Array.isArray(res.applicationCommands)
        ? [
            ...commandsToAdd,
            ...res.applicationCommands.filter((command) => !commandsToAdd.includes(command)),
          ]
        : commandsToAdd;
    }
    return res;
  });

  injector.after(ApplicationCommandSearchStore, "getApplicationSections", (_, res) => {
    res ??= [];
    const commandAndSectionsArray = Array.from(commandAndSections.values()).filter(
      (commandAndSection) => commandAndSection.commands.size,
    );
    if (!res || !commandAndSectionsArray.length) return;
    if (
      !commandAndSectionsArray.every((commandAndSection) =>
        res.some((section) => section.id === commandAndSection.section.id),
      )
    ) {
      const sectionsToAdd = commandAndSectionsArray
        .map((commandAndSection) => commandAndSection.section)
        .filter((section) => res.some((existingSections) => section.id === existingSections.id));
      res = [...res, ...sectionsToAdd];
    }
    return res;
  });

  injector.after(ApplicationCommandSearchStore, "getQueryCommands", ([_, __, query], res) => {
    if (!query || query.startsWith("/")) return res;

    res ??= [];
    const commandsToAdd = Array.from(commandAndSections.values())
      .filter((commandAndSection) => commandAndSection.commands.size)
      .map((commandAndSection) => Array.from(commandAndSection.commands.values()))
      .flat(10);
    for (const command of commandsToAdd) {
      const exists = res.some((c) => c.id === command.id);

      if (exists || !command.name.includes(query)) {
        continue;
      }

      try {
        res.unshift(command);
      } catch {
        res = [command, ...res];
      }
    }

    return res;
  });
}

export async function start(): Promise<void> {
  await injectRepluggedBotIcon();
  await injectRepluggedSectionIcon();
  await injectApplicationCommandSearchStore();
  loadCommands();
}
export function stop(): void {
  injector.uninjectAll();
  unloadCommands();
}
