import { signalStart, waitForReady } from "../modules/webpack";
import { log } from "../modules/logger";

import { ready as commonReady } from "@common";
import { ready as componentsReady } from "../modules/components";
import * as i18n from "../modules/i18n";
import * as coremods from "./coremods";
import * as plugins from "./plugins";
import * as themes from "./themes";
import * as quickCSS from "./quick-css";
import { loadStyleSheet } from "../util";

export async function start(): Promise<void> {
  log("Ignition", "Start", void 0, "Igniting Replugged...");
  const startTime = performance.now();

  loadStyleSheet("replugged://renderer.css");
  i18n.load();
  quickCSS.load();
  await Promise.all([
    coremods.startAll(),
    plugins.startAll(),
    themes.loadMissing().then(() => {
      themes.loadAll();
    }),
  ]);

  log(
    "Ignition",
    "Start",
    void 0,
    `Finished igniting Replugged in ${performance.now() - startTime}ms`,
  );
}

export async function stop(): Promise<void> {
  log("Ignition", "Stop", void 0, "De-igniting Replugged...");
  const startTime = performance.now();

  quickCSS.unload();
  await Promise.all([coremods.stopAll(), plugins.stopAll(), themes.unloadAll()]);

  log(
    "Ignition",
    "Stop",
    void 0,
    `Finished de-igniting Replugged in ${performance.now() - startTime}ms`,
  );
}

export async function restart(): Promise<void> {
  await stop();
  await start();
}

/*
Load order:
1. Register all plaintext patches
2. await waitForReady from webpack
3. signalStart()
4. await reactReady
5. Start coremods, plugins, and themes
*/

export async function ignite(): Promise<void> {
  // This is the function that will be called when loading the window.
  coremods.runPlaintextPatches();
  await plugins.runPlaintextPatches();
  await waitForReady;
  signalStart();
  await commonReady;
  await componentsReady;
  await start();
}
