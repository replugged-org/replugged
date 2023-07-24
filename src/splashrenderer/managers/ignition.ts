import { log } from "../../renderer/modules/logger";
import * as themes from "../../renderer/managers/themes";
import * as quickCSS from "../../renderer/managers/quick-css";

export async function start(): Promise<void> {
  log("Ignition", "Start", void 0, "Igniting Replugged Splash Screen...");
  const startTime = performance.now();

  await themes.loadMissing().then(themes.loadAll);
  // Quick CSS needs to be called after themes are loaded so that it will override the theme's CSS
  quickCSS.load();

  log(
    "Ignition",
    "Start",
    void 0,
    `Finished igniting Replugged Splash Screen in ${performance.now() - startTime}ms`,
  );
}

export function stop(): void {
  log("Ignition", "Stop", void 0, "De-igniting Replugged Splash Screen...");
  const startTime = performance.now();

  quickCSS.unload();
  themes.unloadAll();

  log(
    "Ignition",
    "Stop",
    void 0,
    `Finished de-igniting Replugged Splash Screen in ${performance.now() - startTime}ms`,
  );
}

export async function restart(): Promise<void> {
  stop();
  await start();
}

export async function ignite(): Promise<void> {
  // This is the function that will be called when loading the window.
  await start();
}
