import { Injector } from "../../modules/injector";
import {
  filters,
  getExportsForProps,
  getFunctionKeyBySource,
  waitForModule,
} from "../../modules/webpack";
import { ObjectExports, RepluggedCommand } from "../../../types";

import { commands, section as rpSection } from "../../apis/commands";

const injector = new Injector();

export async function start(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
  const BOT_AVATARS = getExportsForProps(
    await waitForModule(filters.byProps("BOT_AVATARS")),
    ["BOT_AVATARS"],
  ) as Record<string, Record<string, string>>;
  if (BOT_AVATARS) {
    BOT_AVATARS.BOT_AVATARS.replugged = rpSection.icon;
    console.log(BOT_AVATARS)
  } else {
    // make error
  }

  interface ApplicationStoreType {
    [key: string]: (args: unknown) => {
      sectionDescriptors: Array<{ id: string }>;
      commands: RepluggedCommand[];
    };
  }
  const ApplicationCommandStore = await waitForModule(
    filters.bySource('type:"APPLICATION_COMMAND_SEARCH_STORE_UPDATE"'),
  );
  const commandStoreKey = getFunctionKeyBySource(
    ApplicationCommandStore as ObjectExports,
    "APPLICATION_COMMAND_SEARCH_OPEN_TIMING",
  );

  injector.after(
    ApplicationCommandStore as ObjectExports & ApplicationStoreType,
    commandStoreKey!,
    (_, res) => {
      if (!res || !commands.size) return;
      if (
        !Array.isArray(res.sectionDescriptors) ||
        !res.sectionDescriptors.some((section) => section.id == rpSection.id)
      )
        res.sectionDescriptors = Array.isArray(res.sectionDescriptors)
          ? res.sectionDescriptors.splice(1, 0, rpSection)
          : [rpSection];
      if (
        !Array.isArray(res.commands) ||
        Array.from(commands.values()).some((command) => !res.commands.includes(command))
      )
        res.commands = Array.isArray(res.commands)
          ? [
              ...res.commands.filter((command) => !Array.from(commands.values()).includes(command)),
              ...Array.from(commands.values()),
            ]
          : Array.from(commands.values());
      return res;
    },
  );

  interface storeType {
    getChannelState: (args: unknown) => {
      applicationSections: Array<{ id: string }>;
      applicationCommands: RepluggedCommand[];
    };
    getApplicationSections: (args: string) => Array<{ id: string }>;
    useSearchManager: (args: unknown) => unknown;
    getQueryCommands: (...args: [string, string, string]) => RepluggedCommand[];
  }
  const SearchStore = Object.entries(ApplicationCommandStore).find(([_, v]) => {
    if (typeof v === "function") return false;
    if (v.getChannelState) return true;

    return false;
  })?.[1] as unknown as storeType;
  if (SearchStore) {
    injector.after(SearchStore, "getChannelState", (_, res) => {
      if (!res || !commands.size) return;
      if (
        !Array.isArray(res.applicationSections) ||
        !res.applicationSections.some((section) => section.id == rpSection.id)
      )
        res.applicationSections = Array.isArray(res.applicationSections)
          ? [rpSection, ...res.applicationSections]
          : [rpSection];
      if (
        !Array.isArray(res.applicationCommands) ||
        Array.from(commands.values()).some((command) => !res.applicationCommands.includes(command))
      )
        res.applicationCommands = Array.isArray(res.applicationCommands)
          ? [...Array.from(commands.values()), ...res.applicationCommands]
          : Array.from(commands.values());
      return res;
    });

    injector.after(SearchStore, "getApplicationSections", (_, res) => {
      if (!res.find((s) => s.id === rpSection.id)) {
        res.push(rpSection);
      }

      return res;
    });

    injector.after(SearchStore, "getQueryCommands", ([, , query], res) => {
      if (!query || query.startsWith("/")) return res;

      res ??= [];
      for (const command of commands.values()) {
        const exists = res.some((c) => c.id === command.id);

        if (exists || !query.includes(command.name)) {
          continue;
        }

        try {
          res.unshift(command);
        } catch {
          res = [...res, command];
        }
      }

      return res;
    });
  } else {
    // make error
  }

  interface AssetType {
    getApplicationIconURL: (args: { id: string; icon: string }) => string;
  }
  const Assets = Object.entries(await waitForModule(filters.byProps("getApplicationIconURL"))).find(
    ([_, v]) => {
      if (typeof v === "function") return false;
      if (v.getApplicationIconURL) return true;

      return false;
    },
  );
  if (Assets) {
    injector.after(Assets[1] as unknown as AssetType, "getApplicationIconURL", (args, _) => {
      if (args[0].id === rpSection.id) return args[0].icon;
    });
  } else {
    // make error
  }
}

export function stop(): void {
  injector.uninjectAll();
}
