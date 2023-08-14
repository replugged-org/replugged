import { execSync } from "child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";

export const AnsiEscapes = {
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  RED: "\x1b[31m",
};

function isCommandInstalled(command: string): boolean {
  try {
    execSync(`command -v ${command}`);
    return true;
  } catch {
    return false;
  }
}

function getElevationTool(): string {
  if (process.platform === "win32") {
    return "";
  }

  const ELEVATION_TOOLS = ["doas", "sudo", "su -c"];
  const DETECTED_TOOLS = ELEVATION_TOOLS.filter((x) => isCommandInstalled(x));

  if (DETECTED_TOOLS.length === 0) {
    console.error(
      `${AnsiEscapes.RED}Failed to detect any tool for elevation. Assuming no tools are is required.${AnsiEscapes.RESET}`,
    );
    return "";
  }

  return DETECTED_TOOLS[0];
}

export const PRIV_CMD_EXEC = getElevationTool();

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

const CONFIG_FOLDER_NAMES = ["plugins", "themes", "settings", "quickcss"] as const;

export const CONFIG_PATHS = Object.fromEntries(
  CONFIG_FOLDER_NAMES.map((name) => {
    const path = join(CONFIG_PATH, name);
    if (!existsSync(path)) {
      mkdirSync(path);
    }
    return [name, path];
  }),
) as Record<(typeof CONFIG_FOLDER_NAMES)[number], string>;

if (process.platform === "linux") {
  const { uid: REAL_UID, gid: REAL_GID } = statSync(join(CONFIG_PATH, ".."));
  execSync(`${PRIV_CMD_EXEC} chown ${REAL_UID}:${REAL_GID} ${CONFIG_PATH}`);

  CONFIG_FOLDER_NAMES.forEach((folder) =>
    execSync(`${PRIV_CMD_EXEC} chown ${REAL_UID}:${REAL_GID} ${join(CONFIG_PATH, folder)}`),
  );
}

const QUICK_CSS_FILE = join(CONFIG_PATHS.quickcss, "main.css");
if (!existsSync(QUICK_CSS_FILE)) {
  writeFileSync(QUICK_CSS_FILE, "");
}

if (process.platform === "linux") {
  const QUICK_CSS_PERMS = statSync(QUICK_CSS_FILE);
  if (QUICK_CSS_PERMS.gid === 0 && QUICK_CSS_PERMS.uid === 0) {
    console.warn(
      `${AnsiEscapes.YELLOW}Detected quickcss/main.css owned by root, attempting to fix...${AnsiEscapes.RESET}`,
    );

    const { uid: REAL_UID, gid: REAL_GID } = statSync(join(CONFIG_PATH, ".."));
    execSync(`${PRIV_CMD_EXEC} chown ${REAL_UID}:${REAL_GID} ${QUICK_CSS_FILE}`);
  }
}
