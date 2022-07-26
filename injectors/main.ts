import rmdirRf from '../src/fake_node_modules/powercord/util/rmdirRf';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join, sep } from 'path';
import { AnsiEscapes } from './log';
import { AppDirGetter, platforms } from './types';

type InjectorFunction = (
  options: { getAppDir: AppDirGetter },
  platform: platforms
) => Promise<boolean>;

export const inject: InjectorFunction = async ({ getAppDir }, platform) => {
  const appDir = await getAppDir(platform);
  if (existsSync(appDir)) {
    /*
     * @todo: verify if there is nothing in discord_desktop_core as well
     * @todo: prompt to automatically uninject and continue
     */
    console.log(
      'Looks like you already have an injector in place. Try unplugging (`npm run unplug`) and try again.',
      '\n'
    );
    console.log(
      `${AnsiEscapes.YELLOW}NOTE:${AnsiEscapes.RESET} If you already have BetterDiscord or another client mod injected, Replugged cannot run along with it!`
    );
    console.log(
      'Read our FAQ for more details: https://powercord.dev/faq#bd-and-pc'
    );
    return false;
  }

  await mkdir(appDir);
  await Promise.all([
    writeFile(
      join(appDir, 'index.js'),
      `require(\`${__dirname.replace(
        RegExp(sep.repeat(2), 'g'),
        '/'
      )}/patcher.js\`)`
    ),
    writeFile(
      join(appDir, 'package.json'),
      JSON.stringify({
        main: 'index.js',
        name: 'discord'
      })
    )
  ]);

  return true;
};

export const uninject: InjectorFunction = async ({ getAppDir }, platform) => {
  const appDir = await getAppDir(platform);

  if (!existsSync(appDir)) {
    console.log(
      'There is nothing to unplug. You are already running Discord without mods.'
    );
    return false;
  }

  await rmdirRf(appDir);
  return true;
};
