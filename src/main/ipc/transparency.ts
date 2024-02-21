import { BrowserWindow, ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";
// @ts-expect-error Type defs are obtained through @pyke/vibe
import vibePath from "../../vibe.node";

let vibe: typeof import("@pyke/vibe");
if (process.platform === "win32") {
  vibe = require(vibePath) as unknown as typeof import("@pyke/vibe");
}

let currentEffect: Parameters<typeof vibe.applyEffect>[1] | null = null;
ipcMain.handle(
  RepluggedIpcChannels.GET_TRANSPARENCY_EFFECT,
  (): Parameters<typeof vibe.applyEffect>[1] | null => {
    if (process.platform !== "win32") {
      console.warn("GET_TRANSPARENCY_EFFECT only works on Windows");
    }

    return currentEffect;
  },
);

ipcMain.handle(
  RepluggedIpcChannels.APPLY_TRANSPARENCY_EFFECT,
  (_, effect: Parameters<typeof vibe.applyEffect>[1]) => {
    if (process.platform !== "win32") {
      console.warn("APPLY_TRANSPARENCY_EFFECT only works on Windows");
      return;
    }

    let windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => vibe.applyEffect(window, effect));
    currentEffect = effect;
  },
);

let currentVibrancy: Parameters<typeof BrowserWindow.prototype.setVibrancy>[0] = null;
ipcMain.handle(
  RepluggedIpcChannels.GET_VIBRANCY,
  (): Parameters<typeof BrowserWindow.prototype.setVibrancy>[0] => currentVibrancy,
);

ipcMain.handle(
  RepluggedIpcChannels.SET_VIBRANCY,
  (_, vibrancy: Parameters<typeof BrowserWindow.prototype.setVibrancy>[0]) => {
    let windows = BrowserWindow.getAllWindows();

    windows.forEach((window) => window.setVibrancy(vibrancy));
    currentVibrancy = vibrancy;
  },
);
