import { ipcMain } from 'electron';
import fetch from 'node-fetch';
import { RepluggedIpcChannels } from '../../types';

// TODO: update arg to use entity class and get repo/version info from that
async function checkForUpdate(repo: string, version: string): Promise<{
  errored: boolean,
  updated: boolean,
  reason?: string,
}> {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`).catch(e => { });
  if (!res?.ok) {
    return {
      errored: true,
      updated: false,
      reason: res ? `Got HTTP ${res.status} from GitHub` : 'Error fetching from GitHub',
    };
  }
  const data = await res.json();
  const latestVersion = data.tag_name.replace(/^v/, '');
  if (version === latestVersion) {
    return {
      errored: false,
      updated: false,
      reason: 'Already up to date'
    }
  }

  const asset = data.assets[0];
  if (!asset) {
    return {
      errored: true,
      updated: false,
      reason: 'No assets found in release'
    }
  }

  const downloadUrl = asset.browser_download_url;

  const downloadRes = await fetch(downloadUrl).catch(e => {})
  if (!downloadRes?.ok) {
    return {
      errored: true,
      updated: false,
      reason: downloadRes ? `Got HTTP ${downloadRes.status} from GitHub` : 'Error fetching from GitHub',
    };
  }

  const buffer = await downloadRes.buffer();

  // TODO: actually update

  return {
    errored: false,
    updated: true,
  }
}

ipcMain.on(RepluggedIpcChannels.CHECK_FOR_UPDATES, (event) => {
  // TODO: get entity list, run update for each, return info
});

// TODO: update check interval
