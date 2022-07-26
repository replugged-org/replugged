import { readdir } from 'fs/promises';
import { join } from 'path';
import { AppDirGetter } from './types';

const PATHS = {
  stable: 'Discord',
  ptb: 'DiscordPTB',
  canary: 'DiscordCanary',
  dev: 'DiscordDevelopment'
};

export const getAppDir: AppDirGetter = async (platform) => {
  const appdata = process.env.LOCALAPPDATA;
  if (!appdata) {
    throw new Error('LOCALAPPDATA is not set');
  }

  const discordPath = join(appdata, PATHS[platform]);
  const discordDirectory = await readdir(discordPath);

  const currentBuild = discordDirectory
    .filter((path) => path.startsWith('app-'))
    .reverse()[0];

  return join(discordPath, currentBuild, 'resources', 'app');
};
