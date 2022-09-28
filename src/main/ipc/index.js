const { ipcMain } = require("electron");

require("./plugins");
require("./themes");
require("./quick-css");

ipcMain.on('REPLUGGED_GET_DISCORD_PRELOAD', (event) => {
  console.log(event);
  event.returnValue = event.sender.originalPreload;
});
// Handle requesting renderer code