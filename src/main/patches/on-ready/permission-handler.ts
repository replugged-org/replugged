import { session } from "electron";

const defaultPermissionRequestHandler = session.defaultSession.setPermissionRequestHandler.bind(
  session.defaultSession,
);
session.defaultSession.setPermissionRequestHandler = (cb) => {
  defaultPermissionRequestHandler((webContents, permission, callback, details) => {
    if (permission === "media") {
      callback(true);
      return;
    }
    cb?.(webContents, permission, callback, details);
  });
};
