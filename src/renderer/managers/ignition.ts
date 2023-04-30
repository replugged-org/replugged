import { signalStart, waitForReady } from "../modules/webpack";

import * as coremods from "./coremods";
import * as plugins from "./plugins";

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
  console.log("DEBUG: Ignition started");
  coremods.runPlaintextPatches();
  await plugins.runPlaintextPatches();
  console.log("DEBUG: Ignition waiting for webpack ready");
  await waitForReady;
  console.log("DEBUG: Webpack ready");
  signalStart();
  // Using dynamic import here so nothing there is loaded until we're ready.
  await (await import("./start")).start();
}
