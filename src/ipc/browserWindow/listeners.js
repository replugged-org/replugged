const {BrowserWindow} = require('electron');
const {ipcMain} = require('electron');

const windowMap = new Map();
const id = (id => () => id++)(0);

const assert = (event, condition, error) => {
    if (condition) {
        event.returnValue = {
            error,
            result: null
        };
    } 

    return condition;
};

ipcMain.on('REPLUGGED_BW_CREATE', (event, options) => {
    const windowId = id();
    const win = new BrowserWindow(options);

    win.once("close", () => {
        windowMap.delete(windowId);
    });

    windowMap.set(windowId, win);
    event.returnValue = windowId;
});

ipcMain.on('REPLUGGED_BW_DESTROY', (event, windowId) => {
    const win = windowMap.get(windowId);

    if (assert(event, win == null, `No such window ${windowId}`)) return;

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
    const callbacks = new Map();
    ipcMain.on('REPLUGGED_BW_ADD_LISTENER', (e, windowId, event) => {
        if (assert(e, !windowMap.has(windowId), `No such window ${windowId}`)) return;

        const webContents = e.sender;
        const win = windowMap.get(windowId);
        const pointer = id();

        const handler = (_, ...args) => {   
            webContents?.send('REPLUGGED_BW_LISTENER_FIRE', windowId, pointer, ...args);
        };

        win.on(event, handler);
        callbacks.set(pointer);

        e.returnValue = {
            error: null,
            result: pointer
        };
    });

    ipcMain.on('REPLUGGED_BW_REMOVE_LISTENER', (e, windowId, event, pointer) => {
        if (assert(e, !windowMap.has(windowId), `No such window ${windowId}`)) return;
        if (assert(e, !callbacks.has(pointer), `No such listener ${pointer}`)) return;

        const win = windowMap.get(windowId);

        win.off(event, callbacks.get(pointer));
        callbacks.delete(pointer);

        e.returnValue = {
            error: null,
            result: true
        };
    });
}

{
    const resBlacklist = new Set(['on', 'off', 'emit']);
    ipcMain.on('REPLUGGED_BW_CALL_METHOD', (event, windowId, ...args) => {
        const win = windowMap.get(windowId);
        const [method, ...methodArgs] = args;
    
        if (assert(event, win == null, `No such window ${windowId}`)) return;
        if (assert(event, typeof win[method] !== 'function', `Method ${method} is not callable!`)) return;
    
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
        
        if (assert(event, win == null, `No such window ${windowId}`)) return;
        if (assert(win, typeof win[prop] === 'function', `Property ${prop} is a function. Use REPLUGGED_BW_CALL_METHOD instead.`)) return;
        if (assert(win, blacklist.has(prop), `Property ${prop} is blacklisted.`)) return;

        event.returnValue = {
            error: null,
            result: win[prop]
        };
    });
}
