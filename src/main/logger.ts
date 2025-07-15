import { BrowserWindow } from "electron";
import { RepluggedIpcChannels } from "src/types";

export default {
  log: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.log(...args);
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE_LOG, ...args);
    });
  },
  warn: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.warn(...args);
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE_WARN, ...args);
    });
  },
  error: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.error(...args);
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE_ERROR, ...args);
    });
  },
};
