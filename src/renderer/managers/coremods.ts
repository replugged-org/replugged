import type { Promisable } from "type-fest";
import { Logger } from "../modules/logger";
import { patchPlaintext } from "../modules/webpack/plaintext-patch";

import badgesPlaintext from "../coremods/badges/plaintextPatches";
import contextMenuPlaintext from "../coremods/contextMenu/plaintextPatches";
import experimentsPlaintext from "../coremods/experiments/plaintextPatches";
import languagePlaintext from "../coremods/language/plaintextPatches";
import messagePopoverPlaintext from "../coremods/messagePopover/plaintextPatches";
import noDevtoolsWarningPlaintext from "../coremods/noDevtoolsWarning/plaintextPatches";
import noticesPlaintext from "../coremods/notices/plaintextPatches";
import notrackPlaintext from "../coremods/notrack/plaintextPatches";
import titleBarPlaintext from "../coremods/titleBar/plaintextPatches";
import settingsPlaintext from "../coremods/settings/plaintextPatches";

const logger = Logger.api("Coremods");

interface Coremod {
  start?: () => Promisable<void>;
  stop?: () => Promisable<void>;
  [x: string]: unknown; // Allow coremods to export anything else they want
}

export namespace coremods {
  export let badges: Coremod;
  export let commands: Coremod;
  export let contextMenu: Coremod;
  export let installer: Coremod;
  export let language: Coremod;
  export let messagePopover: Coremod;
  export let noDevtoolsWarning: Coremod;
  export let notices: Coremod;
  export let notrack: Coremod;
  export let rdtComponentSourceFix: Coremod;
  export let rpc: Coremod;
  export let settings: Coremod;
  export let watcher: Coremod;
  export let welcome: Coremod;
}

export async function start(name: keyof typeof coremods): Promise<void> {
  if (!(name in coremods)) throw new Error(`Coremod ${name} does not exist`);
  await coremods[name].start?.();
}

export async function stop(name: keyof typeof coremods): Promise<void> {
  if (!(name in coremods)) throw new Error(`Coremod ${name} does not exist`);
  await coremods[name].stop?.();
}

export async function startAll(): Promise<void> {
  coremods.badges = await import("../coremods/badges");
  coremods.commands = await import("../coremods/commands");
  coremods.contextMenu = await import("../coremods/contextMenu");
  coremods.installer = await import("../coremods/installer");
  coremods.language = await import("../coremods/language");
  coremods.messagePopover = await import("../coremods/messagePopover");
  coremods.noDevtoolsWarning = await import("../coremods/noDevtoolsWarning");
  coremods.notices = await import("../coremods/notices");
  coremods.notrack = await import("../coremods/notrack");
  coremods.rdtComponentSourceFix = await import("../coremods/rdtComponentSourceFix");
  coremods.rpc = await import("../coremods/rpc");
  coremods.settings = await import("../coremods/settings");
  coremods.watcher = await import("../coremods/watcher");
  coremods.welcome = await import("../coremods/welcome");

  await Promise.all(
    Object.entries(coremods).map(async ([name, mod]) => {
      try {
        await mod.start?.();
      } catch (e) {
        logger.error(`Failed to start coremod ${name}`, e);
      }
    }),
  );
}

export async function stopAll(): Promise<void> {
  await Promise.allSettled(Object.values(coremods).map((c) => c.stop?.()));
}

export function runPlaintextPatches(): void {
  [
    badgesPlaintext,
    contextMenuPlaintext,
    experimentsPlaintext,
    languagePlaintext,
    messagePopoverPlaintext,
    noDevtoolsWarningPlaintext,
    noticesPlaintext,
    notrackPlaintext,
    settingsPlaintext,
    badgesPlaintext,
    titleBarPlaintext,
  ].forEach(patchPlaintext);
}
