/*
IPC events:
- REPLUGGED_GET_THEME_CSS: returns compiled CSS for a theme by name
- REPLUGGED_LIST_THEMES: returns an array of all valid themes available
- REPLUGGED_UNINSTALL_THEME: uninstalls a theme by name
*/

import { ipcMain } from 'electron';
import { RepluggedIpcChannels } from '../../types';

ipcMain.handle(
  RepluggedIpcChannels.GET_THEME_CSS,
  async (event, themeName: string) => {}
);

ipcMain.handle(RepluggedIpcChannels.LIST_THEMES, async () => {});

ipcMain.handle(
  RepluggedIpcChannels.UNINSTALL_THEME,
  async (event, themeName: string) => {}
);
