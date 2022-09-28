import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { ipcMain } from 'electron';

const cssPath = join(__dirname, '../../../settings/quickcss/main.css');

ipcMain.handle('REPLUGGED_GET_QUICK_CSS', () =>
  readFile(cssPath, { encoding: 'utf-8' })
);
ipcMain.on('REPLUGGED_SAVE_QUICK_CSS', (_, css) =>
  writeFile(cssPath, css, { encoding: 'utf-8' })
);
