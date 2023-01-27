import { ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";

// @ts-expect-error No declaration file
import strings from "../../../i18n";
// @ts-expect-error No declaration file
import overrides from "../../../i18n/overrides";

ipcMain.handle(RepluggedIpcChannels.GET_I18N_STRINGS, () => strings);
ipcMain.handle(RepluggedIpcChannels.GET_I18N_OVERRIDES, () => overrides);
