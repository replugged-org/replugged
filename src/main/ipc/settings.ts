import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { ipcMain } from 'electron';

const corePath = join(__dirname, '../../../settings/core');

ipcMain.handle('REPLUGGED_GET_SETTING', (event, key: string) => {});

ipcMain.on('REPLUGGED_SET_SETTING', (event, key: string, value: any) => {});


ipcMain.handle('REPLUGGED_HAS_SETTING', (event, key: string) => {});


ipcMain.on('REPLUGGED_DELETE_SETTING', (event, key: string) => {});
