import { BrowserWindow, ipcMain } from "electron";
import { type BackgroundMaterialType, RepluggedIpcChannels, type VibrancyType } from "src/types";

const DEFAULT_BACKGROUND_COLOR = "#00000000";

let backgroundMaterial: BackgroundMaterialType | null = null;
ipcMain.handle(RepluggedIpcChannels.GET_BACKGROUND_MATERIAL, (): BackgroundMaterialType | null => {
  if (process.platform !== "win32") {
    console.warn("GET_BACKGROUND_MATERIAL only works on Windows");
  }

  return backgroundMaterial;
});

ipcMain.handle(
  RepluggedIpcChannels.SET_BACKGROUND_MATERIAL,
  (_, material: BackgroundMaterialType | null) => {
    if (process.platform !== "win32") {
      console.warn("SET_BACKGROUND_MATERIAL only works on Windows");
      return;
    }

    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.setBackgroundMaterial(typeof material === "string" ? material : "none");
    });
    backgroundMaterial = material;
  },
);

let currentVibrancy: VibrancyType | null = null;
ipcMain.handle(RepluggedIpcChannels.GET_VIBRANCY, (): VibrancyType | null => currentVibrancy);

ipcMain.handle(RepluggedIpcChannels.SET_VIBRANCY, (_, vibrancy: VibrancyType) => {
  const windows = BrowserWindow.getAllWindows();

  windows.forEach((window) => window.setVibrancy(vibrancy));
  currentVibrancy = vibrancy;
});

let currentBackgroundColor = DEFAULT_BACKGROUND_COLOR;
ipcMain.handle(RepluggedIpcChannels.GET_BACKGROUND_COLOR, () => {
  if (process.platform !== "win32") {
    console.warn("GET_BACKGROUND_COLOR only works on Windows");
  }

  return currentBackgroundColor;
});

ipcMain.handle(RepluggedIpcChannels.SET_BACKGROUND_COLOR, (_, color: string | undefined) => {
  if (process.platform !== "win32") {
    console.warn("SET_BACKGROUND_COLOR only works on Windows");
    return;
  }

  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => window.setBackgroundColor(color || DEFAULT_BACKGROUND_COLOR));
  currentBackgroundColor = color || DEFAULT_BACKGROUND_COLOR;
});
