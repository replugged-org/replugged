module.exports = class BrowserWindow {
    constructor(opts) {
        this._win = PowercordNative.createBrowserWindow(opts);
    }

    get title() {this._win.getProp("title");}
    get webContents() {throw "Unavailable.";}
    get id() {return this._win._windowId;}
    get fullScreen() {return this._win.getProp("fullScreen");}
    get focusable() {return this._win.getProp("focusable ");}
    get shadow() {return this._win.getProp("shadow");}
    get resizable() {return this._win.getProp("resizable");}
    get maximizable() {return this._win.getProp("maximizable");}
    get minimizable() {return this._win.getProp("minimizable");}
    get fullScreenable() {return this._win.getProp("fullScreenable");}
    get closable() {return this._win.getProp("closable");}
    get movable() {return this._win.getProp("movable");}

    destroy() {
        this._win.destroy();
        this._win = null;
    }

    focus() {this._win.callMethod("focus");}
    close() {this._win.callMethod("close");}
    blur() {this._win.callMethod("blur");}

    isFocused() {return this._win.callMethod("isFocused");}
    isDestroyed() {return this._win.callMethod("isDestroyed");}

    show() {this._win.callMethod("show");}
    hide() {this._win.callMethod("hide");}

    async loadURL(url) {return this._win.callAsyncMethod("loadURL", url);} 
    async loadFile(file) {return this._win.callAsyncMethod("loadFile", file);} 

    // FIXME: Needs a proper callback implementations via pointers
    /* on(event, listener) {
        this._win.callMethod("on", event, listener);
    }

    off(event, listener) {
        this._win.callMethod("off", event, listener);
    } */ 
}
