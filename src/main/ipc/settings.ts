import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { ipcMain } from 'electron';
import { RepluggedIpcChannels } from '../../types';

const corePath = join(__dirname, '../../../settings/core');

ipcMain.handle(RepluggedIpcChannels.GET_SETTING, (event, key: string) => {});

ipcMain.on(RepluggedIpcChannels.SET_SETTING, (event, key: string, value: any) => {});


ipcMain.handle(RepluggedIpcChannels.HAS_SETTING, (event, key: string) => {});


ipcMain.on(RepluggedIpcChannels.DELETE_SETTING, (event, key: string) => {});
