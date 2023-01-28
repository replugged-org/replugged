import type { ModuleExports } from "../../../../types";
import { error } from "../../logger";

const modulePromises: Array<Promise<void>> = [];

function importTimeout<T extends ModuleExports>(
  name: string,
  moduleImport: Promise<T>,
  cb: (mod: T) => void,
): void {
  modulePromises.push(
    new Promise<void>((res, rej) => {
      const timeout = setTimeout(() => {
        error("CommonModules", name, void 0, `Could not find module "${name}"`);
        rej(new Error(`Module not found: "${name}`));
      }, 5_000);
      void moduleImport.then((mod) => {
        clearTimeout(timeout);
        cb(mod);
        res();
      });
    }),
  );
}

import type { Channels } from "./channels";
export type { Channels };
export let channels: Channels;
importTimeout("channels", import("./channels"), (mod) => (channels = mod.default));

import * as Constants from "./constants";
export type { Constants };
export let constants: typeof Constants;
importTimeout("constants", import("./constants"), (mod) => (constants = mod));

import type { ContextMenu } from "./contextMenu";
export type { ContextMenu };
export let contextMenu: ContextMenu;
importTimeout("contextMenu", import("./contextMenu"), (mod) => (contextMenu = mod.default));

import type { Flux } from "./flux";
export type { Flux };
export let flux: Flux;
importTimeout("flux", import("./flux"), (mod) => (flux = mod.default));

import type { FluxDispatcher } from "./fluxDispatcher";
export type { FluxDispatcher };
export let fluxDispatcher: FluxDispatcher;
importTimeout(
  "fluxDispatcher",
  import("./fluxDispatcher"),
  (mod) => (fluxDispatcher = mod.default),
);

import type { Guilds } from "./guilds";
export type { Guilds };
export let guilds: Guilds;
importTimeout("guilds", import("./guilds"), (mod) => (guilds = mod.default));

import type HighlightJS from "highlightjs";
export type { HighlightJS };
/**
 * @see {@link https://highlightjs.org/usage/}
 */
export let hljs: typeof HighlightJS;
importTimeout("hljs", import("./hljs"), (mod) => (hljs = mod.default));

import type { I18n } from "./i18n";
export type { I18n };
export let i18n: I18n;
importTimeout("i18n", import("./i18n"), (mod) => (i18n = mod.default));

/**
 * @see {@link https://lodash.com/docs}
 */
export let lodash: typeof window._;
importTimeout("lodash", import("./lodash"), (mod) => (lodash = mod.default));

import type { Messages } from "./messages";
export type { Messages };
export let messages: Messages;
importTimeout("messages", import("./messages"), (mod) => (messages = mod.default));

import type { Modal } from "./modal";
export type { Modal };
export let modal: Modal;
importTimeout("modal", import("./modal"), (mod) => (modal = mod.default));

import type { Toast } from "./toast";
export type { Toast };
export let toast: Toast;
importTimeout("toast", import("./toast"), (mod) => (toast = mod.default));

/**
 * @see {@link https://reactjs.org/docs/react-api.html}
 */
export let React: typeof import("react");
importTimeout("React", import("./react"), (mod) => (React = mod.default));

/**
 * @see {@link https://reactjs.org/docs/react-dom.html}
 */
export let ReactDOM: typeof import("react-dom");
importTimeout("ReactDOM", import("./react-dom"), (mod) => (ReactDOM = mod.default));

import type { Typing } from "./typing";
export type { Typing };
export let typing: Typing;
importTimeout("typing", import("./typing"), (mod) => (typing = mod.default));

import type { Users } from "./users";
export type { Users };
export let users: Users;
importTimeout("users", import("./users"), (mod) => (users = mod.default));

import type { API } from "./api";
export type { API };
export let api: API;
importTimeout("api", import("./api"), (mod) => (api = mod.default));

import type { Parser } from "./parser";
export type { Parser };
export let parser: Parser;
importTimeout("parser", import("./parser"), (mod) => (parser = mod.default));

/**
 * @internal
 * @hidden
 */
export const ready = new Promise<void>((resolve) =>
  Promise.allSettled(modulePromises).then(() => resolve()),
);
