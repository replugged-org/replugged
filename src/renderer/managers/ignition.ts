import { signalStart, waitForReady } from "../modules/webpack/patch-load";
import { error, log } from "../modules/logger";

import { ready as commonReady } from "@common";
import { ready as componentsReady } from "../modules/components";
import * as i18n from "../modules/i18n";
import * as coremods from "./coremods";
import * as plugins from "./plugins";
import * as themes from "./themes";
import * as quickCSS from "./quick-css";
import { loadStyleSheet } from "../util";
import { startAutoUpdateChecking } from "./updater";

export async function start(): Promise<void> {
  log("Ignition", "Start", void 0, "Igniting Replugged...");
  const startTime = performance.now();

  loadStyleSheet("replugged://renderer.css");
  i18n.load();

  let started = false;
  await Promise.race([
    Promise.allSettled([
      coremods.startAll(),
      plugins.startAll(),
      themes.loadMissing().then(themes.loadAll),
    ]),
    // Failsafe to ensure that we always start Replugged
    new Promise((resolve) =>
      setTimeout(() => {
        if (!started) {
          error("Ignition", "Start", void 0, "Ignition timed out after 10 seconds");
          resolve(void 0);
        }
      }, 10_000),
    ),
  ]);
  started = true;

  // Quick CSS needs to be called after themes are loaded so that it will override the theme's CSS
  quickCSS.load();

  // Want to make sure all addons are initialized before starting auto-update checking
  startAutoUpdateChecking();

  log(
    "Ignition",
    "Start",
    void 0,
    `Finished igniting Replugged in ${(performance.now() - startTime).toFixed(2)}ms`,
  );
}

export async function stop(): Promise<void> {
  log("Ignition", "Stop", void 0, "De-igniting Replugged...");
  const startTime = performance.now();

  quickCSS.unload();
  themes.unloadAll();
  await Promise.all([coremods.stopAll(), plugins.stopAll()]);

  log(
    "Ignition",
    "Stop",
    void 0,
    `Finished de-igniting Replugged in ${(performance.now() - startTime).toFixed(2)}ms`,
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
  // Plaintext patches are executed before Discord's preload.
  await coremods.runPlaintextPatches();
  await plugins.loadAll();
  await plugins.runPlaintextPatches();
  // These next things will happen after Discord's preload is called.
  // We schedule them here, but they cannot block the ignite function from returning.
  (async () => {
    await waitForReady;
    signalStart();
    await commonReady();
    await componentsReady();
    await start();
  })();
}

export async function startSplash(): Promise<void> {
  log("Ignition", "Start", void 0, "Igniting Replugged Splash Screen...");
  const startTime = performance.now();

  await themes.loadMissing().then(themes.loadAllSplash);

  log(
    "Ignition",
    "Start",
    void 0,
    `Finished igniting Replugged Splash Screen in ${performance.now() - startTime}ms`,
  );
}
