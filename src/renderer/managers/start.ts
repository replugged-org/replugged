import { ready as commonReady } from "../modules/common";
import { ready as componentsReady } from "../modules/components";
import * as i18n from "../modules/i18n";
import { log } from "../modules/logger";
import { coremods, plugins, quickCSS, themes } from "../replugged";
import { loadStyleSheet } from "../util";

export async function start(): Promise<void> {
  log("Ignition", "Start", void 0, "Igniting Replugged...");
  const startTime = performance.now();

  await commonReady;
  await componentsReady;

  const replugged = await import("../replugged");
  window.replugged = replugged;

  loadStyleSheet("replugged://renderer.css");
  i18n.load();
  quickCSS.load();
  await Promise.all([
    coremods.startAll(),
    plugins.loadAll().then(() => plugins.startAll()),
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
