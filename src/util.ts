import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const REPLUGGED_FOLDER_NAME = "replugged";
export const CONFIG_PATH = (() => {
  switch (process.platform) {
    case "win32":
      return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
    case "darwin":
      return join(process.env.HOME || "", "Library", "Application Support", REPLUGGED_FOLDER_NAME);
    default:
      if (process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
      }
      return join(process.env.HOME || "", ".config", REPLUGGED_FOLDER_NAME);
  }
})();

if (!existsSync(CONFIG_PATH)) {
  console.log("Does not exist");
  mkdirSync(CONFIG_PATH);
}

const CONFIG_FOLDER_NAMES = ["plugins", "themes", "settings"] as const;

export const CONFIG_PATHS = Object.fromEntries(
  CONFIG_FOLDER_NAMES.map((name) => {
    const path = join(CONFIG_PATH, name);
    if (!existsSync(path)) {
      mkdirSync(path);
    }
    return [name, path];
  }),
) as Record<typeof CONFIG_FOLDER_NAMES[number], string>;
