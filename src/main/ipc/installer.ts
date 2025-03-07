import { ipcMain } from "electron";
import {
  CheckResultFailure,
  CheckResultSuccess,
  InstallResultFailure,
  InstallResultSuccess,
  InstallerType,
  ReCelledIpcChannels,
} from "../../types";
import { CONFIG_PATH, CONFIG_PATHS } from "../../util.mjs";
import { readFile } from "fs/promises";
import { writeFile as originalWriteFile } from "original-fs";
import { join, resolve, sep } from "path";
import { AnyAddonManifestOrReCelled, anyAddonOrReCelled } from "src/types/addon";
import { getSetting } from "./settings";
import { promisify } from "util";
import { WEBSITE_URL } from "src/constants";

const writeFile = promisify(originalWriteFile);

/* eslint-disable @typescript-eslint/naming-convention */
interface ReleaseAsset {
  url: string;
  browser_download_url: string;
  id: number;
  node_id: string;
  name: string;
  label: string | null;
  state: "uploaded" | "open";
  content_type: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  uploader: Record<string, unknown>;
}
/* eslint-enable @typescript-eslint/naming-convention */

async function github(
  identifier: string,
  id?: string,
): Promise<CheckResultSuccess | CheckResultFailure> {
  const [owner, repo] = identifier.split("/");
  if (!owner || !repo) {
    return {
      success: false,
      error: "Invalid repo identifier",
    };
  }

  let res;

  try {
    res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`).then((res) =>
      res.json(),
    );
  } catch (err) {
    return {
      success: false,
      // @ts-expect-error ts error tbd
      error: err,
    };
  }

  const asset = res.assets.find((asset: ReleaseAsset) =>
    id ? asset.name === `${id}.asar` : asset.name.endsWith(".asar"),
  );

  if (!asset) {
    return {
      success: false,
      error: "No asar asset found",
    };
  }

  const manifestAsset = res.assets.find(
    (manifestAsset: ReleaseAsset) => manifestAsset.name === asset.name.replace(/\.asar$/, ".json"),
  );

  if (!manifestAsset) {
    return {
      success: false,
      error: "No manifest asset found",
    };
  }

  let manifest: AnyAddonManifestOrReCelled;
  try {
    const json = await fetch(manifestAsset.browser_download_url).then((res) => res.json());
    manifest = anyAddonOrReCelled.parse(json);
  } catch {
    return {
      success: false,
      error: "Failed to parse manifest",
    };
  }

  return {
    success: true,
    manifest,
    name: asset.name,
    url: asset.browser_download_url,
    webUrl: res.html_url,
  };
}

async function store(id: string): Promise<CheckResultSuccess | CheckResultFailure> {
  const apiUrl = getSetting("dev.recelled.Settings", "apiUrl", WEBSITE_URL);
  const STORE_BASE_URL = `${apiUrl}/api/v1/store`;
  const manifestUrl = `${STORE_BASE_URL}/${id}`;
  const asarUrl = `${manifestUrl}.asar`;

  const res = await fetch(manifestUrl);
  if (!res.ok) {
    return {
      success: false,
      error: "Failed to fetch manifest",
    };
  }

  let manifest;
  try {
    manifest = anyAddonOrReCelled.parse(await res.json());
  } catch {
    return {
      success: false,
      error: "Failed to parse manifest",
    };
  }

  return {
    success: true,
    manifest,
    name: `${id}.asar`,
    url: asarUrl,
  };
}

const handlers: Record<
  string,
  (identifier: string, id?: string) => Promise<CheckResultSuccess | CheckResultFailure>
> = {
  github,
  store,
};

ipcMain.handle(
  ReCelledIpcChannels.GET_ADDON_INFO,
  async (
    _,
    type: string,
    identifier: string,
    id?: string,
  ): Promise<CheckResultSuccess | CheckResultFailure> => {
    if (!(type in handlers)) {
      return {
        success: false,
        error: "Unknown updater type",
      };
    }

    return handlers[type](identifier, id);
  },
);

const getBaseName = (type: InstallerType | "recelled"): string => {
  switch (type) {
    case "replugged-plugin":
      return CONFIG_PATHS.plugins;
    case "replugged-theme":
      return CONFIG_PATHS.themes;
    case "recelled":
      return CONFIG_PATH;
  }
};

ipcMain.handle(
  ReCelledIpcChannels.INSTALL_ADDON,
  async (
    _,
    type: InstallerType | "recelled",
    path: string,
    url: string,
    update: boolean,
    version?: string,
  ): Promise<InstallResultSuccess | InstallResultFailure> => {
    const query = new URLSearchParams();
    query.set("type", update ? "update" : "install");
    if (version) query.set("version", version);

    let res;
    try {
      res = await fetch(`${url}?${query}`);
    } catch (err) {
      return {
        success: false,
        error: `Failed to fetch update: ${err}`,
      };
    }
    let file;
    try {
      file = await res.arrayBuffer();
    } catch (err) {
      return {
        success: false,
        error: `Failed to read update: ${err}`,
      };
    }

    const buf = Buffer.from(file);

    const base = getBaseName(type);
    const filePath = resolve(base, path);
    if (!filePath.startsWith(`${base}${sep}`)) {
      // Ensure file changes are restricted to the base path
      return {
        success: false,
        error: "Invalid path",
      };
    }

    console.log(url, filePath);

    try {
      await writeFile(filePath, buf);
    } catch (err) {
      return {
        success: false,
        error: `Failed to write file: ${err}`,
      };
    }

    return {
      success: true,
    };
  },
);

ipcMain.handle(ReCelledIpcChannels.GET_RECELLED_VERSION, async () => {
  const path = join(__dirname, "package.json");
  try {
    const packageJson = JSON.parse(await readFile(path, "utf8"));
    return packageJson.version;
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return "dev";
    }
    throw err;
  }
});
