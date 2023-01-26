import { ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";

ipcMain.handle(RepluggedIpcChannels.GET_I18N_STRINGS, () => require("../../../i18n").default);
ipcMain.handle(
  RepluggedIpcChannels.GET_I18N_OVERRIDES,
  () => require("../../../i18n/overrides").default,
);
