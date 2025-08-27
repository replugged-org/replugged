import { BrowserWindow } from "electron";
import { RepluggedIpcChannels } from "src/types";

export default {
  log: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.log(...args);
      return;
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE, "log", ...args);
    });
  },
  info: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.info(...args);
      return;
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE, "info", ...args);
    });
  },
  warn: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.warn(...args);
      return;
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE, "warn", ...args);
    });
  },
  error: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.error(...args);
      return;
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE, "error", ...args);
    });
  },
  verbose: (...args: unknown[]) => {
    const Windows = BrowserWindow.getAllWindows();
    if (!Windows.length) {
      console.debug(...args);
      return;
    }
    Windows.forEach((win) => {
      win.webContents.send(RepluggedIpcChannels.CONSOLE, "verbose", ...args);
    });
  },
};
