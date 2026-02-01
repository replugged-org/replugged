import { BrowserWindow, Menu, app, dialog } from "electron";
import { getAddonInfo, getRepluggedVersion, installAddon } from "../ipc/installer";

// Monkey patch to add our menu items into the tray context menu
const originalBuildFromTemplate = Menu.buildFromTemplate.bind(Menu);

async function showInfo(title: string, message: string): Promise<Electron.MessageBoxReturnValue> {
  return dialog.showMessageBox({ type: "info", title, message, buttons: ["Ok"] });
}
async function showError(title: string, message: string): Promise<Electron.MessageBoxReturnValue> {
  return dialog.showMessageBox({ type: "error", title, message, buttons: ["Close"] });
}

Menu.buildFromTemplate = (items: Electron.MenuItemConstructorOptions[]) => {
  if (items[0]?.label !== "Discord" || items.some((e) => e.label === "Replugged"))
    return originalBuildFromTemplate(items);

  const currentVersion = getRepluggedVersion();

  const repluggedMenuItems: Electron.MenuItemConstructorOptions = {
    label: "Replugged",
    submenu: [
      {
        label: "Toggle Developer Tools",
        click: () => {
          const win =
            BrowserWindow.getFocusedWindow() ||
            BrowserWindow.getAllWindows().find((w) => !w.isDestroyed() && !w.getParentWindow());
          if (win) win.webContents.toggleDevTools();
        },
        accelerator: process.platform === "darwin" ? "Option+Cmd+I" : "Ctrl+Shift+I",
      },
      {
        label: "Update Replugged",
        click: async () => {
          try {
            if (currentVersion === "dev") {
              await showInfo(
                "Developer Mode",
                "You are currently running Replugged in developer mode and Replugged will not be able to update itself.",
              );
              return;
            }

            const repluggedInfo = await getAddonInfo("store", "dev.replugged.Replugged");
            if (!repluggedInfo.success) {
              console.error(repluggedInfo.error);
              await showError(
                "Update Check Failed",
                "Unable to check for Replugged updates. Check logs for details.",
              );
              return;
            }

            const newVersion = repluggedInfo.manifest.version;
            if (currentVersion === newVersion) {
              await showInfo(
                "Up to Date",
                `You're running the latest version of Replugged (v${currentVersion}).`,
              );
              return;
            }

            const installed = await installAddon(
              "replugged",
              "replugged.asar",
              repluggedInfo.url,
              true,
              newVersion,
            );
            if (!installed.success) {
              console.error(installed.error);
              await showError(
                "Install Update Failed",
                "An error occurred while installing the Replugged update. Check logs for details.",
              );
              return;
            }

            await showInfo(
              "Successfully Updated",
              process.platform === "linux"
                ? "Replugged updated but we can't relaunch automatically on Linux. Discord will close now."
                : "Replugged updated and will relaunch Discord now to take effect!",
            );

            app.relaunch();
            app.quit();
          } catch (err) {
            console.error(err);
            await showError(
              "Update Error",
              "An unexpected error occurred. Check logs for details.",
            );
          }
        },
      },
      {
        enabled: false,
        label: `Version: ${currentVersion === "dev" ? "dev" : `v${currentVersion}`}`,
      },
    ],
  };

  items.splice(
    // Quit + separator
    -2,
    0,
    { type: "separator" },
    repluggedMenuItems,
  );

  return originalBuildFromTemplate(items);
};
