import { error } from "../logger";

const modulePromises: Array<() => Promise<void>> = [];

function importTimeout<T>(name: string, moduleImport: Promise<T>, cb: (mod: T) => void): void {
  modulePromises.push(
    () =>
      new Promise<void>((res, rej) => {
        const timeout = setTimeout(() => {
          error("CommonModules", name, void 0, `Could not find module "${name}"`);
          rej(new Error(`Module not found: "${name}`));
        }, 10_000);
        void moduleImport
          .then((mod) => {
            clearTimeout(timeout);
            cb(mod);
            res();
          })
          .catch((err: unknown) => {
            error("CommonModules", name, void 0, `Failed to import module "${name}"`, err);
            rej(err instanceof Error ? err : new Error(String(err)));
          });
      }),
  );
}

// Stores

import type { Channels } from "./channels";
export let channels: Channels;
importTimeout("channels", import("./channels"), (mod) => (channels = mod.default));

import type { Guilds } from "./guilds";
export let guilds: Guilds;
importTimeout("guilds", import("./guilds"), (mod) => (guilds = mod.default));

import type { Messages } from "./messages";
export let messages: Messages;
importTimeout("messages", import("./messages"), (mod) => (messages = mod.default));

import type { Users } from "./users";
export let users: Users;
importTimeout("users", import("./users"), (mod) => (users = mod.default));

// Utilities

import type { API } from "./api";
export let api: API;
importTimeout("api", import("./api"), (mod) => (api = mod.default));

import type Components from "./components";
export let components: typeof Components;
importTimeout("components", import("./components"), (mod) => (components = mod.default));

import type * as Constants from "./constants";
export let constants: typeof Constants;
importTimeout("constants", import("./constants"), (mod) => (constants = mod));

import type ContextMenu from "./contextMenu";
export let contextMenu: typeof ContextMenu;
importTimeout("contextMenu", import("./contextMenu"), (mod) => (contextMenu = mod.default));

import type Flux from "./flux";
export let flux: typeof Flux;
importTimeout("flux", import("./flux"), (mod) => (flux = mod.default));

import type FluxDispatcher from "./fluxDispatcher";
export let fluxDispatcher: typeof FluxDispatcher;
importTimeout(
  "fluxDispatcher",
  import("./fluxDispatcher"),
  (mod) => (fluxDispatcher = mod.default),
);

import type { FluxHooks } from "./fluxHooks";
export let fluxHooks: FluxHooks;
importTimeout("fluxHooks", import("./fluxHooks"), (mod) => (fluxHooks = mod.default));

import type * as I18n from "./i18n";
export let i18n: typeof I18n;
importTimeout("i18n", import("./i18n"), (mod) => (i18n = mod));

import type LocalStorage from "./localStorage";
export let localStorage: typeof LocalStorage;
importTimeout("localStorage", import("./localStorage"), (mod) => (localStorage = mod.default));

import type MarginStyles from "./marginStyles";
export let marginStyles: typeof MarginStyles;
importTimeout("marginStyles", import("./marginStyles"), (mod) => (marginStyles = mod.default));

import type Modal from "./modal";
export let modal: typeof Modal;
importTimeout("modal", import("./modal"), (mod) => (modal = mod.default));

import type Parser from "./parser";
export let parser: typeof Parser;
importTimeout("parser", import("./parser"), (mod) => (parser = mod.default));

import type * as Toast from "./toast";
export let toast: typeof Toast;
importTimeout("toast", import("./toast"), (mod) => (toast = mod));

import type Typing from "./typing";
export let typing: typeof Typing;
importTimeout("typing", import("./typing"), (mod) => (typing = mod.default));

import type { CreateZustandStore } from "./zustand";
export type { CreateZustandStore };
export let zustand: CreateZustandStore;
importTimeout("zustand", import("./zustand"), (mod) => (zustand = mod.default));

// External Libraries

/**
 * @see {@link https://github.com/JedWatson/classnames}
 */
import type ClassNames from "./classnames";
export let classNames: typeof ClassNames;
importTimeout("classnames", import("./classnames"), (mod) => (classNames = mod.default));

/**
 * @see {@link https://highlightjs.org/}
 */
export let hljs: typeof import("highlight.js").default;
importTimeout("hljs", import("./hljs"), (mod) => (hljs = mod.default));

/**
 * @see {@link https://lodash.com/docs}
 */
export let lodash: typeof import("lodash");
importTimeout("lodash", import("./lodash"), (mod) => (lodash = mod.default));

/**
 * @see {@link https://momentjs.com/docs/}
 */
export let moment: typeof import("moment");
importTimeout("moment", import("./moment"), (mod) => (moment = mod.default));

/**
 * @see {@link https://react.dev/}
 */
export let React: typeof import("react");
importTimeout("React", import("./react"), (mod) => (React = mod.default));

/**
 * @see {@link https://react.dev/reference/react-dom}
 */
export let ReactDOM: typeof import("react-dom");
importTimeout("ReactDOM", import("./react-dom"), (mod) => (ReactDOM = mod.default));

/**
 * @internal
 * @hidden
 */
export const ready = (): Promise<void> =>
  new Promise<void>((resolve) =>
    Promise.allSettled(modulePromises.map((promiseFn) => promiseFn())).then(() => resolve()),
  );
