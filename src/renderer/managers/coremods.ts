import type { Promisable } from "type-fest";
import { Logger } from "../modules/logger";
import { patchPlaintext } from "../modules/webpack/plaintext-patch";

import badgesPlaintext from "../coremods/badges/plaintextPatches";
import commandsPlaintext from "../coremods/commands/plaintextPatches";
import contextMenuPlaintext from "../coremods/contextMenu/plaintextPatches";
import experimentsPlaintext from "../coremods/experiments/plaintextPatches";
import languagePlaintext from "../coremods/language/plaintextPatches";
import messagePopoverPlaintext from "../coremods/messagePopover/plaintextPatches";
import noticesPlaintext from "../coremods/notices/plaintextPatches";
import noTrackPlaintext from "../coremods/noTrack/plaintextPatches";
import noXSSDefensesPlaintext from "../coremods/noXSSDefenses/plaintextPatches";
import popoutThemingPlaintext from "../coremods/popoutTheming/plaintextPatches";
import reactErrorDecoderPlaintext from "../coremods/reactErrorDecoder/plaintextPatches";
import settingsPlaintext from "../coremods/settings/plaintextPatches";
import titleBarPlaintext from "../coremods/titleBar/plaintextPatches";

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
  export let devCompanion: Coremod;
  export let installer: Coremod;
  export let language: Coremod;
  export let messagePopover: Coremod;
  export let notices: Coremod;
  export let noTrack: Coremod;
  export let noXSSDefenses: Coremod;
  export let reactErrorDecoder: Coremod;
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
  coremods.notices = await import("../coremods/notices");
  coremods.noTrack = await import("../coremods/noTrack");
  coremods.reactErrorDecoder = await import("../coremods/reactErrorDecoder");
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
    { patch: badgesPlaintext, name: "replugged.coremod.badges" },
    { patch: commandsPlaintext, name: "replugged.coremod.commands" },
    { patch: contextMenuPlaintext, name: "replugged.coremod.contextMenu" },
    { patch: experimentsPlaintext, name: "replugged.coremod.experiments" },
    { patch: languagePlaintext, name: "replugged.coremod.language" },
    { patch: messagePopoverPlaintext, name: "replugged.coremod.messagePopover" },
    { patch: noXSSDefensesPlaintext, name: "replugged.coremod.noXSSDefenses" },
    { patch: noticesPlaintext, name: "replugged.coremod.notices" },
    { patch: noTrackPlaintext, name: "replugged.coremod.noTrack" },
    { patch: popoutThemingPlaintext, name: "replugged.coremod.popoutTheming" },
    { patch: reactErrorDecoderPlaintext, name: "replugged.coremod.reactErrorDecoder" },
    { patch: settingsPlaintext, name: "replugged.coremod.settings" },
    { patch: titleBarPlaintext, name: "replugged.coremod.titleBar" },
  ].forEach(({ patch, name }) => patchPlaintext(patch, name));
}
