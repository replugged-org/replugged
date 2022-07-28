import { ipcRenderer } from 'electron';
import './ipc/renderer';
import StyleManager from './Powercord/managers/styles';

// Add Replugged's modules
// TODO: Make sure we don';t need this
// module.Module.globalPaths.push(join(__dirname, 'fake_node_modules'));

// Discord's preload
const preload = ipcRenderer.sendSync('POWERCORD_GET_PRELOAD');
if (preload) {
  require(preload);
}

declare global {
  // eslint-disable-next-line no-var
  var __SPLASH__: boolean | undefined;
  // eslint-disable-next-line no-var
  var sm: StyleManager;
}

window.__SPLASH__ = true;

// CSS Injection
function init () {
  document.body.classList.add('powercord');
  global.sm = new StyleManager();
  global.sm.loadThemes();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
