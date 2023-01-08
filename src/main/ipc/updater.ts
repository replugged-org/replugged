import { ipcMain } from "electron";
import {
  RepluggedIpcChannels,
  UpdateCheckResultFailure,
  UpdateCheckResultSuccess,
  UpdateInstallResultFailure,
  UpdateInstallResultSuccess,
  UpdaterType,
} from "../../types";
import { Octokit } from "@octokit/rest";
import { CONFIG_PATHS } from "../../util";
import { readFile, readdir, writeFile } from "fs/promises";
import fetch from "node-fetch";
import { join } from "path";
import { createHash } from "crypto";

const octokit = new Octokit();

async function getHashRecursive(path: string): Promise<Buffer[]> {
  const files = await readdir(path, { withFileTypes: true });

  const hashes = await Promise.all(
    files.map(async (file) => {
      if (file.isDirectory()) {
        return await getHashRecursive(path);
      } else {
        const buf = await readFile(join(path, file.name));
        return buf;
      }
    }),
  );

  return hashes.flat();
}

async function getFolderHash(path: string): Promise<string> {
  const files = await getHashRecursive(path);
  const hash = createHash("sha256");
  files.forEach((file) => hash.update(Buffer.from(file)));
  return hash.digest("hex");
}

async function github(
  identifier: string,
  id: string,
): Promise<UpdateCheckResultSuccess | UpdateCheckResultFailure> {
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

  const asset = res.data.assets.find((asset) => asset.name === `${id}.asar`);

  if (!asset) {
    return {
      success: false,
      error: "No asar asset found",
    };
  }

  return {
    success: true,
    id: asset.id.toString(),
    url: asset.browser_download_url,
  };
}

const handlers: Record<
  string,
  (identifier: string, id: string) => Promise<UpdateCheckResultSuccess | UpdateCheckResultFailure>
> = {
  github,
};

ipcMain.handle(
  RepluggedIpcChannels.CHECK_UPDATE,
  async (
    _,
    type: string,
    identifier: string,
    id: string,
  ): Promise<UpdateCheckResultSuccess | UpdateCheckResultFailure> => {
    if (!(type in handlers)) {
      return {
        success: false,
        error: "Unknown updater type",
      };
    }

    return handlers[type](identifier, id);
  },
);

const getBaseName = (type: UpdaterType): string => {
  switch (type) {
    case "replugged-plugin":
      return CONFIG_PATHS.plugins;
    case "replugged-theme":
      return CONFIG_PATHS.themes;
  }
};

ipcMain.handle(
  RepluggedIpcChannels.INSTALL_UPDATE,
  async (
    _,
    type: UpdaterType,
    path: string,
    url: string,
  ): Promise<UpdateInstallResultSuccess | UpdateInstallResultFailure> => {
    let res;
    try {
      res = await fetch(url);
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

    try {
      await writeFile(join(getBaseName(type), path), buf);
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

ipcMain.handle(
  RepluggedIpcChannels.GET_HASH,
  async (_, type: UpdaterType, path: string): Promise<string> => {
    return await getFolderHash(join(getBaseName(type), path));
  },
);
