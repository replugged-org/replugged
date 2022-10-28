import { signalStart, waitForReady } from "../modules/webpack";
import { log } from "../modules/logger";
import { reactReady } from "../common/react";

import * as coremods from "./coremods";
import * as plugins from "./plugins";
import * as themes from "./themes";
import * as quickCSS from "./quick-css";

export async function start(): Promise<void> {
  log("Ignition", "Start", void 0, "Igniting Replugged...");
  const startTime = performance.now();

  await coremods.startAll();
  await plugins.startAll();
  await themes.loadMissing();
  themes.loadAll();
  quickCSS.load();

  log("Ignition", "Start", void 0, `Finished igniting Replugged in ${performance.now() - startTime}ms`);
}

export async function stop(): Promise<void> {
  log("Ignition", "Stop", void 0, "De-igniting Replugged...");
  const startTime = performance.now();

  await coremods.stopAll();
  await plugins.stopAll();
  themes.unloadAll();
  quickCSS.unload();

  log("Ignition", "Stop", void 0, `Finished de-igniting Replugged in ${performance.now() - startTime}ms`);
}

export async function restart(): Promise<void> {
  await stop();
  await start();
}

// Before anything loads
// await waitForReady

// signalStart()

// await reactReady
// This function acts as a gate that allows webpack startup to proceed.
export async function ignite(): Promise<void> {
  // This is the function that will be called when loading the window.
  coremods.runPlaintextPatches();
  plugins.runPlaintextPatches();
  await waitForReady;
  signalStart();
  await reactReady;
  await start();
}
