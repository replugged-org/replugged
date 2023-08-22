import { execSync } from "child_process";
import { chownSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const REPLUGGED_FOLDER_NAME = "replugged";
export const configPathFn = (): string => {
  const realUser = process.env.SUDO_USER || process.env.DOAS_USER;
  let home = process.env.HOME;
  switch (process.platform) {
    case "win32":
      return join(process.env.APPDATA || "", REPLUGGED_FOLDER_NAME);
    case "darwin":
      return join(home || "", "Library", "Application Support", REPLUGGED_FOLDER_NAME);
    default:
      if (process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, REPLUGGED_FOLDER_NAME);
      }

      if (realUser) {
        try {
          // Get the home directory of the sudo user from /etc/passwd
          const realUserHome = execSync(`getent passwd ${realUser}`, {
            stdio: [null, null, "ignore"],
          })
            .toString("utf-8")
            .split(":")[5];
          if (realUserHome && existsSync(realUserHome)) {
            home = realUserHome;
          } else {
            console.error(
              new Error(`Passwd entry for "${realUser}" contains an invalid home directory.`),
            );
            process.exit(1);
          }
        } catch (error) {
          console.error("Could not find passwd entry of sudo/doas user", error);
          process.exit(1);
        }
      }
      return join(home || "", ".config", REPLUGGED_FOLDER_NAME);
  }
};

export const CONFIG_PATH = configPathFn();

if (!existsSync(CONFIG_PATH)) {
  mkdirSync(CONFIG_PATH, { recursive: true });
}

const CONFIG_FOLDER_NAMES = [
  "plugins",
  "themes",
  "settings",
  "quickcss",
  "react-devtools",
] as const;

export const CONFIG_PATHS = Object.fromEntries(
  CONFIG_FOLDER_NAMES.map((name) => {
    const path = join(CONFIG_PATH, name);
    if (!existsSync(path)) {
      mkdirSync(path);
    }
    return [name, path];
  }),
) as Record<(typeof CONFIG_FOLDER_NAMES)[number], string>;

const { uid: REAL_UID, gid: REAL_GID } = statSync(join(CONFIG_PATH, ".."));
const shouldChown = process.platform === "linux";
if (shouldChown) {
  chownSync(CONFIG_PATH, REAL_UID, REAL_GID);
  CONFIG_FOLDER_NAMES.forEach((folder) => chownSync(join(CONFIG_PATH, folder), REAL_UID, REAL_GID));
}

const QUICK_CSS_FILE = join(CONFIG_PATHS.quickcss, "main.css");
if (!existsSync(QUICK_CSS_FILE)) {
  writeFileSync(QUICK_CSS_FILE, "");
  if (shouldChown) {
    chownSync(QUICK_CSS_FILE, REAL_UID, REAL_GID);
  }
}

const SETTINGS_DIR = CONFIG_PATHS.settings;
export function readSettingsSync(namespace: string): Map<string, unknown> {
  try {
    const data = readFileSync(join(SETTINGS_DIR, `${namespace}.json`), "utf8");
    return new Map(Object.entries(JSON.parse(data)));
  } catch {
    return new Map();
  }
}
