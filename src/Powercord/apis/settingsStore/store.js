const { join } = require('path');
const { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');
const { SETTINGS_FOLDER } = require('powercord/constants');
const { Flux, FluxDispatcher } = require('powercord/webpack');
const ActionTypes = require('./constants');
const ConfigManager = require('./manager.js');

if (!existsSync(SETTINGS_FOLDER)) {
  mkdirSync(SETTINGS_FOLDER);
}

function loadSettings (file) {
  const categoryId = file.split('.')[0];
  try {
    return [
      file.split('.')[0],
      JSON.parse(
        readFileSync(join(SETTINGS_FOLDER, file), 'utf8')
      )
    ];
  } catch (e) {
    // Maybe corrupted settings; Let's consider them empty
    return [ categoryId, {} ];
  }
}

const settingsMgr = new ConfigManager(Object.fromEntries(
  readdirSync(SETTINGS_FOLDER)
    .filter(f => !f.startsWith('.') && f.endsWith('.json'))
    .map(loadSettings)
));

function setSetting (category, setting, value) {
  console.log('setSettings');
  settingsMgr.set(`${category}.${setting}`, value);
}

function updateSettings (category, newSettings) {
  settingsMgr.set(category, newSettings);
}

function updateSetting (category, setting, value) {
  console.log('updateSettings');
  if (value === void 0) {
    settingsMgr.delete(`${category}.${setting}`);
  } else {
    settingsMgr.set(`${category}.${setting}`, value);
  }
}

function toggleSetting (category, setting, defaultValue) {
  const previous = settingsMgr.get(`${category}.${setting}`, defaultValue);
  settingsMgr.set(`${category}.${setting}`, !previous);
}

function deleteSetting (category, setting) {
  settingsMgr.delete(category, setting);
}

class SettingsStore extends Flux.Store {
  constructor (Dispatcher, handlers) {
    super(Dispatcher, handlers);

    this._persist = global._.debounce(this._persist.bind(this), 1000);
    this.addChangeListener(this._persist);
  }

  getAllSettings () {
    return settingsMgr.all;
  }

  getSettings (category) {
    return settingsMgr.get(category) || {};
  }

  getSetting (category, nodePath, defaultValue) {
    const oldPath = `${category}.${nodePath.replaceAll('.', '\\.')}`;
    if (settingsMgr.get(oldPath) !== void 0) {
      const previous = settingsMgr.get(oldPath);
      console.log(oldPath);
      settingsMgr.delete(oldPath);
      settingsMgr.set(`${category}.${nodePath}`, previous);
      this._persist();

      return previous;
    }
    return settingsMgr.get(`${category}.${nodePath}`, defaultValue);
  }

  getSettingsKeys (category) {
    return Object.keys(this.getSettings(category));
  }

  _persist () {
    for (const category in settingsMgr.all) {
      const file = join(SETTINGS_FOLDER, `${category}.json`);
      const data = JSON.stringify(settingsMgr.get(category), null, 2);
      writeFileSync(file, data);
    }
  }
}

module.exports = new SettingsStore(FluxDispatcher, {
  [ActionTypes.SET_SETTING]: ({ category, settings, value }) => setSetting(category, settings, value),
  [ActionTypes.DELETE_SETTING]: ({ category, setting }) => deleteSetting(category, setting),

  [ActionTypes.UPDATE_SETTINGS]: ({ category, settings }) => updateSettings(category, settings),
  [ActionTypes.TOGGLE_SETTING]: ({ category, setting, defaultValue }) => toggleSetting(category, setting, defaultValue),
  [ActionTypes.UPDATE_SETTING]: ({ category, setting, value }) => updateSetting(category, setting, value)
});
