const {BrowserWindow} = require('electron');
const {ipcMain} = require('electron');

const windowMap = new Map();
const id = (id => () => id++)(0);

ipcMain.on('REPLUGGED_BW_CREATE', (event, options) => {
    const windowId = id();
    
    windowMap.set(windowId, new BrowserWindow(options));
    event.returnValue = windowId;
});

ipcMain.on('REPLUGGED_BW_DESTROY', (event, windowId) => {
    const win = windowMap.get(windowId);

    if (!win) {
        event.returnValue = {
            error: `No such window ${windowId}`,
            result: null
        };
        return;
    }

    win.destroy();
    windowMap.delete(windowId);
    event.returnValue = {
        error: null,
        result: true
    };
});

ipcMain.handle('REPLUGGED_BW_CALL_ASYNC_METHOD', async (_, windowId, ...args) => {
    const win = windowMap.get(windowId);
    const [method, ...methodArgs] = args;

    if (!win) {
        return {
            error: `No such window ${windowId}`,
            result: null
        };
    }

    if (typeof win[method] !== 'function') {
        return {
            error: `Method ${method} does not callable!`,
            result: null
        };
    }

    return win[method].apply(win, methodArgs)
        .then(res => ({error: null, result: res}))
        .catch(error => ({error, result: null}));
});

{
    const resBlacklist = new Set(['on', 'off', 'emit']);
    ipcMain.on('REPLUGGED_BW_CALL_METHOD', (event, windowId, ...args) => {
        const win = windowMap.get(windowId);
        const [method, ...methodArgs] = args;
    
        if (!win) {
            event.returnValue = {
                error: `No such window ${windowId}`,
                result: null
            };
            return;
        }
    
        if (typeof win[method] !== 'function') {
            event.returnValue = {
                error: `Method ${method} does not callable!`,
                result: null
            };
            return;
        }
    
        const res = win[method].apply(win, methodArgs) ?? null;
        event.returnValue = {
            error: null,
            result: resBlacklist.has(method) ? undefined : res
        };
    });
}

{
    const blacklist = new Set(['webContents', 'devToolsWebContents']);
    ipcMain.on('REPLUGGED_BW_GET_PROP', (event, windowId, prop) => {
        const win = windowMap.get(windowId);
    
        if (!win) {
            event.returnValue = {
                error: `No such window ${windowId}`,
                result: null
            };
            return;
        }
    
        if (typeof win[prop] === 'function') {
            event.returnValue = {
                error: `Property ${prop} is a function. Use REPLUGGED_BW_CALL_METHOD instead.`,
                result: null
            };
            return;
        }

        if (blacklist.has(prop)) {
            event.returnValue = {
                error: `Property ${prop} is blacklisted.`,
                result: null
            }
            return;
        }

        event.returnValue = {
            error: null,
            result: win[prop] ?? null
        };
    });
}
