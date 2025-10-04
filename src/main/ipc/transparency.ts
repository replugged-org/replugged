import { BrowserWindow, ipcMain } from "electron";
import { type BackgroundMaterialType, RepluggedIpcChannels, type VibrancyType } from "src/types";

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

ipcMain.handle(RepluggedIpcChannels.SET_VIBRANCY, (_, vibrancy: VibrancyType | null) => {
  const windows = BrowserWindow.getAllWindows();

  windows.forEach((window) => window.setVibrancy(vibrancy));
  currentVibrancy = vibrancy;
});
