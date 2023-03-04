import { ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";

// @ts-expect-error No declaration file
import strings from "../../../i18n";

ipcMain.handle(RepluggedIpcChannels.GET_I18N_STRINGS, () => strings);
