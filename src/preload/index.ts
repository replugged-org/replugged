import "./RepluggedNative";
import { ipcRenderer, webFrame } from "electron";

import { RepluggedIpcChannels } from "src/types";

const renderer: string = ipcRenderer.sendSync(RepluggedIpcChannels.GET_REPLUGGED_RENDERER);

// webFrame.executeJavaScript returns a Promise, but we don't have any use for it
void webFrame.executeJavaScript(renderer);

try {
  // Get and execute Discord preload
  // If Discord ever sandboxes its preload, we'll have to eval the preload contents directly
  const preload: string = ipcRenderer.sendSync(RepluggedIpcChannels.GET_DISCORD_PRELOAD);
  if (preload) require(preload);
} catch (err) {
  console.error("Error loading original preload", err);
}
