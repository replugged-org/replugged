// WARNING ! Need to stay in version ~6.x.x until Replugged support ESM modules
const dotProp = require('dot-prop');


/* eslint-disable no-undef */
if (globalThis.structuredClone) {
  globalThis.structuredClone = function (value) {
    if (!value) {
      return value;
    }
    return JSON.parse(JSON.stringify(value));
  };
}
/* eslint-enable no-undef */

class ConfigManager {
  /**
     * Constructor
     * @param {object} defaults
     */
  constructor (defaults) {
    if (defaults) {
      this.all = {
        ...defaults,
        ...this.all
      };
    }
    this._all = {};
  }

  /**
     * @return {object}
     */
  get all () {
    try {
      return structuredClone(this._all);
    } catch (error) {
      if (error.name === 'DataCloneError') {
        return {};
      }

      throw error;
    }
  }

  /**
     * @param {object} value
     */
  set all (value) {
    try {
      this._all = structuredClone(value);
    } catch (error) {
      if (error.name === 'DataCloneError') {
        return;
      }

      throw error;
    }
  }

  /**
     * @return {number} The total keys count
     */
  get size () {
    return Object.keys(this.all || {}).length;
  }

  /**
     * @param {string} key The key to get
     * @return {any} The value of the key
     * @throws {Error} If the key is not found
     */
  get (key, defaultValue) {
    return dotProp.get(this.all, key, defaultValue);
  }

  set (key, value) {
    const config = this.all;

    if (arguments.length === 1) {
      for (const k of Object.keys(key)) {
        dotProp.set(config, k, key[k]);
      }
    } else {
      dotProp.set(config, key, value);
    }

    this.all = config;
  }

  has (key) {
    return dotProp.has(this.all, key);
  }

  delete (key) {
    const config = this.all;
    dotProp.delete(config, key);
    this.all = config;
  }

  clear () {
    this.all = {};
  }
}

module.exports = ConfigManager;
