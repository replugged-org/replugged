import { ipcMain } from "electron";
import {
  CheckResultFailure,
  CheckResultSuccess,
  InstallResultFailure,
  InstallResultSuccess,
  InstallerType,
  RepluggedIpcChannels,
} from "../../types";
import { Octokit } from "@octokit/rest";
import { CONFIG_PATH, CONFIG_PATHS } from "../../util.mjs";
import { readFile } from "fs/promises";
import { writeFile as originalWriteFile } from "original-fs";
import fetch from "node-fetch";
import { join, resolve, sep } from "path";
import { AnyAddonManifestOrReplugged, anyAddonOrReplugged } from "src/types/addon";
import { getSetting } from "./settings";
import { promisify } from "util";
import { WEBSITE_URL } from "src/constants";

const writeFile = promisify(originalWriteFile);

const octokit = new Octokit({
  request: {
    fetch,
  },
});

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
    res = await octokit.rest.repos.getLatestRelease({
      owner,
      repo,
    });
  } catch (err) {
    return {
      success: false,
      // @ts-expect-error err tbd
      error: err,
    };
  }

  const asset = res.data.assets.find((asset) =>
    id ? asset.name === `${id}.asar` : asset.name.endsWith(".asar"),
  );

  if (!asset) {
    return {
      success: false,
      error: "No asar asset found",
    };
  }

  const manifestAsset = res.data.assets.find(
    (manifestAsset) => manifestAsset.name === asset.name.replace(/\.asar$/, ".json"),
  );

  if (!manifestAsset) {
    return {
      success: false,
      error: "No manifest asset found",
    };
  }

  let manifest: AnyAddonManifestOrReplugged;
  try {
    const json = await fetch(manifestAsset.browser_download_url).then((res) => res.json());
    manifest = anyAddonOrReplugged.parse(json);
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
    webUrl: res.data.html_url,
  };
}

async function store(id: string): Promise<CheckResultSuccess | CheckResultFailure> {
  const apiUrl = await getSetting("dev.replugged.Settings", "apiUrl", WEBSITE_URL);
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
    manifest = anyAddonOrReplugged.parse(await res.json());
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
  RepluggedIpcChannels.GET_ADDON_INFO,
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

const getBaseName = (type: InstallerType | "replugged"): string => {
  switch (type) {
    case "replugged-plugin":
      return CONFIG_PATHS.plugins;
    case "replugged-theme":
      return CONFIG_PATHS.themes;
    case "replugged":
      return CONFIG_PATH;
  }
};

ipcMain.handle(
  RepluggedIpcChannels.INSTALL_ADDON,
  async (
    _,
    type: InstallerType | "replugged",
    path: string,
    url: string,
    update: boolean,
    version?: string,
  ): Promise<InstallResultSuccess | InstallResultFailure> => {
    const query = new URLSearchParams();
    query.set("type", update ? "update" : "install");
    if (version) query.set("version", version);

    if (type === "replugged") {
      // Manually set Path and URL for security purposes
      path = "replugged.asar";
      const apiUrl = await getSetting("dev.replugged.Settings", "apiUrl", WEBSITE_URL);
      url = `${apiUrl}/api/v1/store/dev.replugged.Replugged.asar`;
    }

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

ipcMain.handle(RepluggedIpcChannels.GET_REPLUGGED_VERSION, async () => {
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
