import { API } from 'powercord/entities';

/**
 * @typedef PowercordKeybind
 * @property {String} keybind Keybind accelerator
 * @property {Function} executor Executor
 * @property {Boolean} isGlobal Whether the keybind should be usable when Discord is not focused or not
 * @see https://github.com/electron/electron/blob/master/docs/api/accelerator.md
 */
type PowercordKeybind = {
  keybind: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  executor: Function,
  isGlobal: boolean
}

/**
 * Replugged Keybinds API
 * @property {Object.<String, PowercordKeybind>} keybinds Keybinds
 */
class KeybindsAPI extends API {
  keybinds: Record<string, PowercordKeybind> = {}

  /**
   * Registers a keybind
   * @param {String} id Keybind ID
   * @param {PowercordKeybind} keybind Keybind
   */
  registerKeybind (id: string, keybind: PowercordKeybind) {
    throw new Error('Keybinds API is currently not working');
    // eslint-disable-next-line no-unreachable
    if (this.keybinds[id]) {
      throw new Error(`Keybind ${id} is already registered!`);
    }
    this.keybinds[id] = keybind;
    this._register(keybind);
  }

  /**
   * Changes a keybind
   * @param {String} id Keybind ID to update
   * @param {String} newBind New keybind to bind
   */
  changeBind (id: string, newBind: string) {
    throw new Error('Keybinds API is currently not working');
    // eslint-disable-next-line no-unreachable
    if (!this.keybinds[id]) {
      throw new Error(`Keybind ${id} is not registered!`);
    }

    this._unregister(this.keybinds[id]);
    this.keybinds[id].keybind = newBind;
    this._register(this.keybinds[id]);
  }

  /**
   * Unregisters a keybind
   * @param {String} id Keybind to unregister
   */
  unregisterKeybind (id: string) {
    throw new Error('Keybinds API is currently not working');
    // eslint-disable-next-line no-unreachable
    if (this.keybinds[id]) {
      this._unregister(this.keybinds[id]);
      delete this.keybinds[id];
    }
  }

  /** @private */
  _register (keybind: PowercordKeybind) {
    try {
      if (keybind.isGlobal) {
        // globalShortcut.register(keybind.keybind, keybind.executor);
      } else {
        // localShortcut.register(keybind.keybind, keybind.executor);
      }
    } catch (e) {
      this.error('Failed to register keybind!', e);
    }
  }

  /** @private */
  _unregister (keybind: PowercordKeybind) {
    try {
      if (keybind.isGlobal) {
        // globalShortcut.unregister(keybind.keybind);
      } else {
        // localShortcut.unregister(keybind.keybind);
      }
    } catch (e) {
      // let it fail silently, probably just invalid/unset keybind
    }
  }
}

export default KeybindsAPI;
