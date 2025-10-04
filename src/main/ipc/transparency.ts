import { BrowserWindow, ipcMain } from "electron";
import { type BackgroundMaterialType, RepluggedIpcChannels, type VibrancyType } from "src/types";

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
  },
);

ipcMain.handle(RepluggedIpcChannels.SET_VIBRANCY, (_, vibrancy: VibrancyType | null) => {
  if (process.platform !== "darwin") {
    console.warn("SET_VIBRANCY only works on macOS");
    return;
  }

  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => window.setVibrancy(vibrancy));
});
