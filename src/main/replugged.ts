import { app, net, protocol, session } from "electron";
import { join } from "path";
import { CONFIG_PATHS } from "src/util.mjs";
import { pathToFileURL } from "url";
import { getSetting } from "./ipc/settings";

import "./ipc";
import "./patches";

// Copied from old codebase
app.once("ready", async () => {
  await import("./csp");
  await import("./patches/on-ready");

  // TODO: Eventually in the future, this should be migrated to IPC for better performance
  protocol.handle("replugged", (request) => {
    let filePath = "";
    const reqUrl = new URL(request.url);
    switch (reqUrl.hostname) {
      case "renderer.css":
        filePath = join(__dirname, "./renderer.css");
        break;
      case "assets":
        filePath = join(__dirname, reqUrl.hostname, reqUrl.pathname);
        break;
      case "quickcss":
        filePath = join(CONFIG_PATHS.quickcss, reqUrl.pathname);
        break;
      case "theme":
        filePath = join(CONFIG_PATHS.themes, reqUrl.pathname);
        break;
      case "plugin":
        filePath = join(CONFIG_PATHS.plugins, reqUrl.pathname);
        break;
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });

  const rdtSetting = getSetting<boolean>("dev.replugged.Settings", "reactDevTools", false);
  if (rdtSetting) {
    await session.defaultSession.loadExtension(CONFIG_PATHS["react-devtools"]);
  }
});
