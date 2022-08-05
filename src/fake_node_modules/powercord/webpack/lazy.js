/* eslint-disable callback-return */
const listeners = new Map();
let originalPush;

// lazily required since otherwise we have a circular dependency (index -> old.webpack -> lazy -> index)
let pcWebpack;

function onPush (chunk) {
  const modules = chunk[1];

  for (const id in modules) {
    const mod = modules[id];
    modules[id] = function (module, exports, require) {
      try {
        mod(module, exports, require);
      } catch (error) {
        console.error('Error while loading webpack chunk. Rethrowing', error);
        // Since the original function threw, best to rethrow to not alter behaviour
        throw error;
      }
      for (const [ filter, callback ] of listeners) {
        try {
          if (filter(exports)) {
            listeners.delete(filter);
            callback(exports);
          } else if (exports.default && filter(exports.default)) {
            listeners.delete(filter);
            callback(exports.default);
          }
        } catch (error) {
          console.error('Error while firing callback for webpack chunk', error);
        }
      }
    };
  }

  return originalPush.call(webpackChunkdiscord_app, chunk);
}

/**
 * Do not use or you will be slapped
 */
function _patchPush () {
  originalPush = webpackChunkdiscord_app.push;
  Object.defineProperty(webpackChunkdiscord_app, 'push', {
    get: () => onPush,
    set: (v) => originalPush = v,
    enumerable: true
  });
}

/**
 * Subscribe to webpack to listen for lazily added modules
 * @param {function|string[]} filter Filter function to test modules with
 * @param {function} callback Callback to call once a module matches the filter. Receives
 * the module's exports as argument.
 */
function subscribe (filter, callback) {
  const wp = pcWebpack ?? (pcWebpack = require('.'));
  const existingMod = wp.getModule(filter, false);
  if (existingMod) {
    callback(existingMod);
    return;
  }

  if (Array.isArray(filter)) {
    const keys = filter;
    filter = m => keys.every(key => m.hasOwnProperty(key) || (m.__proto__ && m.__proto__.hasOwnProperty(key)));
  } else if (typeof filter !== 'function') {
    throw new Error(`filter must be an array or function, got ${typeof filter}`);
  }

  if (typeof callback !== 'function') {
    throw new Error(`callback must be a function, got ${typeof filter}`);
  }

  listeners.set(filter, callback);
}

/**
 * Asynchronously wait for a module, useful for retrieving lazily loaded modules
 *
 * Please note that unlike getModule, this will never return null. If your filter matches no module,
 * the promise will simply never resolve.
 * @param {function|string[]} filter Module filter
 * @returns Promise<Module>
 */
function waitFor (filter) {
  return new Promise((resolve, reject) => {
    try {
      subscribe(filter, resolve);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  _patchPush,
  subscribe,
  waitFor
};
