import { Injector } from "../../modules/injector";
import {
  filters,
  getFunctionBySource,
  getFunctionKeyBySource,
  waitForModule,
} from "../../modules/webpack";
import { ObjectExports, RawModule, RepluggedCommand } from "../../../types";

import { commands, section as rpSection } from "../../apis/commands";

const injector = new Injector();

export async function start(): Promise<void> {
  interface ApplicationStoreType {
    JK: (args: unknown) => {
      sectionDescriptors: Array<{id: string}>;
      commands: RepluggedCommand[]
    }
  }  
  const ApplicationCommandStore = await waitForModule<RawModule & ApplicationStoreType>(
    filters.bySource('type:"APPLICATION_COMMAND_SEARCH_STORE_UPDATE"'),
  );
  injector.after(ApplicationCommandStore, "JK", (args, res) => {
    console.log("applicationcommandstore", args, res);
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
  });

  interface storeType {
    getChannelState: (args: unknown) => {
      applicationSections: Array<{id: string}>
    };
  }
  const CommandStore = Object.entries(ApplicationCommandStore).find(([_, v]) => {
    if (typeof v === 'function') return false;

    if (v.getChannelState) return true;

    return false;
  });
  if (CommandStore) {
    injector.after(CommandStore[1] as unknown as storeType, "getChannelState", (args, res) => {
      console.log("getchannelstate", args, res);
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
                      Array.from(commands.values()).some(
                        (command) => !res.applicationCommands.includes(command)
                      )
                    )
                      res.applicationCommands = Array.isArray(
                        res.applicationCommands
                      )
                        ? [...Array.from(commands.values()), ...res.applicationCommands]
                        : Array.from(commands.values());   
      return res;
    });
  } else {
    // make error
  }

  interface AssetType {
    getApplicationIconURL: (args: {
      id: string;
      icon: string;
    }) => string
  }
  const Assets = Object.entries(await waitForModule(filters.byProps("getApplicationIconURL"))).find(([_, v]) => {
    if (typeof v === 'function') return false;
    if (v.getApplicationIconURL) return true;

    return false;
  });
  if (Assets) {
    injector.after(Assets[1] as unknown as AssetType, "getApplicationIconURL", (args, res) => {
      if (args[0].id !== rpSection.id) return res;
      return args[0].icon;
    });
  } else {
    // make error
  }
}

export function stop(): void {
  injector.uninjectAll();
}
