import { BrowserWindow } from "electron";

export type BackgroundMaterialType = Parameters<
  typeof BrowserWindow.prototype.setBackgroundMaterial
>[0];

export type VibrancyType = Parameters<typeof BrowserWindow.prototype.setVibrancy>[0];
