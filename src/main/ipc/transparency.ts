import { ipcMain } from "electron";
import { RepluggedIpcChannels } from "../../types";

ipcMain.handle(RepluggedIpcChannels.APPLY_TRANSPARENCY_EFFECT, () => {});
