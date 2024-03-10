import { BrowserWindow, ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";
import os from "os";

let vibe: typeof import("@pyke/vibe");
let release = os.release().split(".").map(Number);
let usesVibe =
  // Windows
  process.platform === "win32" &&
  // Before Electron 24
  Number(process.versions.electron.split(".")[0]) < 24 &&
  // Before Windows 11 22H2+
  release[0] <= 10 && // 11 doesn't exist yet but it could.
  release[1] < 22621;

if (usesVibe) {
  // @ts-expect-error Type defs are obtained through @pyke/vibe
  import("../../vibe.node")
    .then((module) => {
      vibe = module as unknown as typeof import("@pyke/vibe");
    })
    .catch((error) => {
      console.error("Failed to load vibe.", error);
    });
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
  (_, effect: Parameters<typeof vibe.applyEffect>[1] | null) => {
    if (process.platform !== "win32") {
      console.warn("APPLY_TRANSPARENCY_EFFECT only works on Windows");
      return;
    }

    let windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      if (usesVibe) {
        // The valid options for setBackgroundMaterial are "auto" | "none" | "mica" | "acrylic" | "tabbed".
        // This goes against vibe which allows for "unified-acrylic" and "blurbehind".
        // Also, vibe does not allow for "auto", "none" or "tabbed"

        // @ts-expect-error Only exists in electron 24+, our types don't have this.
        window.setBackgroundMaterial(effect === null ? "none" : effect); // NULL is used to disable.
      } else if (effect === null) {
        vibe.clearEffects(window);
      } else {
        vibe.applyEffect(window, effect);
      }
    });
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
