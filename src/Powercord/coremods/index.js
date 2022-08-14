const coremods = require('./registry');
const reload = require('./__reload');
const unloadFuncs = [];

module.exports = {
  async load () {
    for (let mod of coremods) {
      if (typeof mod === 'object') {
        mod = mod.default;
      }
      try {
        const unload = await mod();
        if (typeof unload === 'function') {
          unloadFuncs.push(unload);
        }
      } catch (e) {
        console.error(e); // Stronger logging + warning
      }
    }

    powercord.reload_coremods = reload;
  },

  unload () {
    return Promise.all(unloadFuncs.map(f => f()));
  }
};
