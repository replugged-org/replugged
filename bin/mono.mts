// WARNING: any imported files need to be added to files in package.json

import { existsSync, readdirSync } from "fs";
import path from "path";
import { directory } from "./index.mjs";
import prompts from "prompts";
import { onCancel } from "./release.mjs";

export const isMonoRepo =
  existsSync(path.join(process.cwd(), "plugins")) || existsSync(path.join(process.cwd(), "themes"));

export type AddonType = "plugins" | "themes";

export function getAddonFolder(type: AddonType): string[] {
  if (!existsSync(path.join(directory, type))) return [];
  const folder = readdirSync(path.join(directory, type), { withFileTypes: true });

  folder.filter((dirent) => dirent.isDirectory());

  return folder.map((direct) => direct.name);
}

interface SelectedAddon {
  type: AddonType;
  name: string;
}

export async function selectAddon(type: AddonType | "all"): Promise<SelectedAddon> {
  if (type !== "all") {
    const folder = getAddonFolder(type as AddonType);

    const { addon } = await prompts(
      {
        type: "select",
        name: "addon",
        message: "Select an addon",
        choices: folder.map((folderName) => ({
          title: folderName,
          value: { type, name: folderName },
        })),
      },
      { onCancel },
    );

    return addon;
  } else {
    const plugins: string[] = [];
    const themes: string[] = [];

    if (existsSync(path.join(directory, "plugins"))) {
      readdirSync(path.join(directory, "plugins"), { withFileTypes: true }).forEach((dirent) => {
        if (dirent.isDirectory()) plugins.push(dirent.name);
      });
    }
    if (existsSync(path.join(directory, "themes"))) {
      readdirSync(path.join(directory, "themes"), { withFileTypes: true }).forEach((dirent) => {
        if (dirent.isDirectory()) themes.push(dirent.name);
      });
    }

    const { addon } = await prompts(
      {
        type: "select",
        name: "addon",
        message: "Select an addon",
        choices: [
          ...plugins.map((plugin) => ({
            title: `${plugin} (plugin)`,
            value: { type: "plugins", name: plugin },
          })),
          ...themes.map((theme) => ({
            title: `${theme} (theme)`,
            value: { type: "themes", name: theme },
          })),
        ],
      },
      { onCancel },
    );

    return addon;
  }
}
