import type { AnyRepluggedCommand, RepluggedCommandSection } from "../../../types";
import { Injector } from "../../modules/injector";
import { Logger } from "../../modules/logger";
import { waitForProps } from "../../modules/webpack";

import { commandAndSections, defaultSection } from "../../apis/commands";
import { loadCommands, unloadCommands } from "./commands";

const logger = Logger.api("Commands");
const injector = new Injector();

interface ApplicationCommandSearchStoreMod {
  useDiscoveryState: (...args: unknown[]) =>
    | {
        sectionDescriptors: RepluggedCommandSection[];
        commands: AnyRepluggedCommand[];
        filteredSectionId: string | null;
        activeSections: RepluggedCommandSection[];
        commandsByActiveSection: Array<{
          section: RepluggedCommandSection;
          data: AnyRepluggedCommand[];
        }>;
      }
    | undefined;
  useQueryState: (...args: unknown[]) => unknown;
  useSearchStoreOpenState: (...args: unknown[]) => unknown;
  search: (...args: unknown[]) => unknown;
  default: ApplicationCommandSearchStore;
}

interface ApplicationCommandSearchStore {
  getChannelState: (...args: unknown[]) =>
    | {
        applicationSections: RepluggedCommandSection[];
        applicationCommands: AnyRepluggedCommand[];
      }
    | undefined;
  getApplicationSections: (...args: unknown[]) => RepluggedCommandSection[] | undefined;
  useSearchManager: (...args: unknown[]) => unknown;
  getQueryCommands: (...args: [string, string, string]) => AnyRepluggedCommand[] | undefined;
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

async function injectApplicationCommandSearchStore(): Promise<void> {
  // The module which contains the store
  const ApplicationCommandSearchStoreMod = await waitForProps<ApplicationCommandSearchStoreMod>(
    "useDiscoveryState",
    "useQueryState",
    "useSearchStoreOpenState",
    "search",
  );

  // Base handler function for ApplicationCommandSearchStore which is ran to get the info in store
  // commands are mainly added here
  injector.after(ApplicationCommandSearchStoreMod, "useDiscoveryState", (_, res) => {
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
      if (res.sectionDescriptors.some((section) => section.id === "-2")) {
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
      if (res.activeSections.some((section) => section.id === "-2")) {
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
        res.commandsByActiveSection.some(
          (activeCommandAndSections) => activeCommandAndSections.section.id === "-2",
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

  // The store itself
  const ApplicationCommandSearchStore = ApplicationCommandSearchStoreMod.default;

  // Channel state gets update with each character entered in text box and search so we patch this to keep our custom section
  // even after updates happen
  injector.after(ApplicationCommandSearchStore, "getChannelState", (_, res) => {
    const commandAndSectionsArray = Array.from(commandAndSections.values()).filter(
      (commandAndSection) => commandAndSection.commands.size,
    );
    if (!res || !commandAndSectionsArray.length) return res;
    if (
      !Array.isArray(res.applicationSections) ||
      !commandAndSectionsArray.every((commandAndSection) =>
        res.applicationSections.some((section) => section.id === commandAndSection.section.id),
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

  // Makes sure if our custom section is included or not
  // Add it if not
  injector.after(ApplicationCommandSearchStore, "getApplicationSections", (_, res) => {
    res ??= [];
    const commandAndSectionsArray = Array.from(commandAndSections.values()).filter(
      (commandAndSection) => commandAndSection.commands.size,
    );
    if (!commandAndSectionsArray.length) return;
    if (
      !commandAndSectionsArray.every(
        (commandAndSection) => res?.some((section) => section.id === commandAndSection.section.id),
      )
    ) {
      const sectionsToAdd = commandAndSectionsArray
        .map((commandAndSection) => commandAndSection.section)
        .filter((section) => res?.some((existingSections) => section.id === existingSections.id));
      res.push(...sectionsToAdd);
    }
    return res;
  });

  // Slash command search patched to return our slash commands too
  // only those which match tho
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
  await injectApplicationCommandSearchStore();
  await injectProfileFetch();
  loadCommands();
}
export function stop(): void {
  injector.uninjectAll();
  unloadCommands();
}
