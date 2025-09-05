import { execSync } from "child_process";
import {
  chownSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { extractAll } from "@electron/asar";
import { rm } from "fs/promises";

const TMP_DIR = tmpdir();

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

for (const file of readdirSync(TMP_DIR)) {
  if (file.startsWith("replugged-addons-")) {
    const tempDir = join(TMP_DIR, file);
    void rm(tempDir, { recursive: true, force: true });
  }
}

const CONFIG_FOLDER_NAMES = [
  "plugins",
  "themes",
  "settings",
  "quickcss",
  "react-devtools",
  "temp_addons",
] as const;

export const CONFIG_PATHS = Object.fromEntries(
  CONFIG_FOLDER_NAMES.map((name) => {
    switch (name) {
      case "temp_addons": {
        return [name, mkdtempSync(join(TMP_DIR, "replugged-addons-"))];
      }
      default: {
        const path = join(CONFIG_PATH, name);
        if (!existsSync(path)) {
          mkdirSync(path);
        }
        return [name, path];
      }
    }
  }),
) as Record<(typeof CONFIG_FOLDER_NAMES)[number], string>;

const { uid: REAL_UID, gid: REAL_GID } = statSync(join(CONFIG_PATH, ".."));
const shouldChown = process.platform === "linux";
if (shouldChown) {
  chownSync(CONFIG_PATH, REAL_UID, REAL_GID);
  for (const folder of CONFIG_FOLDER_NAMES) {
    if (folder !== "temp_addons") chownSync(join(CONFIG_PATH, folder), REAL_UID, REAL_GID);
  }
}

const QUICK_CSS_FILE = join(CONFIG_PATHS.quickcss, "main.css");
if (!existsSync(QUICK_CSS_FILE)) {
  writeFileSync(QUICK_CSS_FILE, "");
  if (shouldChown) {
    chownSync(QUICK_CSS_FILE, REAL_UID, REAL_GID);
  }
}
export const extractAddon = (srcPath: string, destPath: string): void => {
  mkdirSync(destPath, { recursive: true });
  extractAll(srcPath, destPath);
};

export const getAddonPath = (pathname: string, mainPath: string): string =>
  join(
    pathname.includes(".asar") ? CONFIG_PATHS.temp_addons : mainPath,
    pathname.replace(".asar", ""),
  );
