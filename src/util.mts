import esbuild from "esbuild";
import { execSync } from "child_process";
import { chownSync, existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import path, { join } from "path";
import chalk from "chalk";

const RECELLED_FOLDER_NAME = "recelled";
export const configPathFn = (): string => {
  const realUser = process.env.SUDO_USER || process.env.DOAS_USER;
  let home = process.env.HOME;
  switch (process.platform) {
    case "win32":
      return join(process.env.APPDATA || "", RECELLED_FOLDER_NAME);
    case "darwin":
      return join(home || "", "Library", "Application Support", RECELLED_FOLDER_NAME);
    default:
      if (process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, RECELLED_FOLDER_NAME);
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
      return join(home || "", ".config", RECELLED_FOLDER_NAME);
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

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0b";

  const k = 1024;
  const dm = 1;
  const sizes = ["b", "kb", "mb", "gb"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
};

export const logBuildPlugin: esbuild.Plugin = {
  name: "logBuild",
  setup: (build) => {
    let start: number;

    build.onStart(() => {
      start = Date.now();
    });
    build.onEnd((result) => {
      const time = Date.now() - start;
      const files = result.metafile?.outputs || {};

      const fileData = Object.entries(files)
        .sort(([a], [b]) => {
          const aIsMap = a.endsWith(".map");
          const bIsMap = b.endsWith(".map");
          if (aIsMap && !bIsMap) return 1;
          if (!aIsMap && bIsMap) return -1;

          return 0;
        })
        .map(([file, { bytes }]) => {
          const { sep } = path;
          const dirname = path.dirname(file);
          const basename = path.basename(file);

          const coloredName = [dirname, sep, chalk.bold(basename)].join("");

          const sizeText = formatBytes(bytes);
          const isBigFile = bytes > Math.pow(1024, 2) && !file.endsWith(".map"); // 1mb
          const coloredSize = isBigFile ? chalk.yellow(sizeText) : chalk.cyan(sizeText);
          const suffix = isBigFile ? chalk.yellow(" ⚠️") : "";

          return {
            name: coloredName,
            size: coloredSize,
            suffix,
          };
        });
      const maxNameLength = Math.max(...fileData.map(({ name }) => name.length));
      const maxSizeLength = Math.max(...fileData.map(({ size }) => size.length));

      console.log("");
      fileData.forEach(({ name, size, suffix }) => {
        console.log(`  ${name.padEnd(maxNameLength + 1)} ${size.padStart(maxSizeLength)}${suffix}`);
      });
      console.log("");

      console.log(`⚡ ${chalk.green(`Done in ${time.toLocaleString()}ms`)}`);
    });
  },
};
