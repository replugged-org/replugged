import { Awaitable } from "src/types";
import { patchPlaintext } from "../modules/webpack";

import { default as experimentsPlaintext } from "../coremods/experiments/plaintextPatches";
import { default as settingsPlaintext } from "../coremods/settings/plaintextPatches";

interface Coremod {
  start?: () => Awaitable<void>;
  stop?: () => Awaitable<void>;
  [x: string]: unknown; // Allow coremods to export anything else they want
}

export namespace coremods {
  export let noDevtoolsWarning: Coremod;
  export let settings: Coremod;
}

export async function start(name: keyof typeof coremods): Promise<void> {
  await coremods[name]?.start?.();
}

export async function stop(name: keyof typeof coremods): Promise<void> {
  await coremods[name]?.stop?.();
}

export async function startAll(): Promise<void> {
  coremods.noDevtoolsWarning = await import("../coremods/noDevtoolsWarning");
  coremods.settings = await import("../coremods/settings");
  await Promise.allSettled(Object.values(coremods).map((c) => c.start?.()));
}

export async function stopAll(): Promise<void> {
  await Promise.allSettled(Object.values(coremods).map((c) => c.stop?.()));
}

export function runPlaintextPatches(): void {
  [experimentsPlaintext, settingsPlaintext].forEach(patchPlaintext);
}
