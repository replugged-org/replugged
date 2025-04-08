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
export type { Channels };
export let channels: Channels;
importTimeout("channels", import("./channels"), (mod) => (channels = mod.default));

import type { Guilds } from "./guilds";
export type { Guilds };
export let guilds: Guilds;
importTimeout("guilds", import("./guilds"), (mod) => (guilds = mod.default));

import type { Messages } from "./messages";
export type { Messages };
export let messages: Messages;
importTimeout("messages", import("./messages"), (mod) => (messages = mod.default));

import type { Users } from "./users";
export type { Users };
export let users: Users;
importTimeout("users", import("./users"), (mod) => (users = mod.default));

// Utilities

import type { API } from "./api";
export type { API };
export let api: API;
importTimeout("api", import("./api"), (mod) => (api = mod.default));

import type { DiscordComponents } from "./components";
export type { DiscordComponents };
export let components: DiscordComponents;
importTimeout("components", import("./components"), (mod) => (components = mod.default));

import type * as Constants from "./constants";
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

import type { FluxHooks } from "./fluxHooks";
export type { FluxHooks };
export let fluxHooks: FluxHooks;
importTimeout("fluxHooks", import("./fluxHooks"), (mod) => (fluxHooks = mod.default));

import type { I18n } from "./i18n";
export type { I18n };
export let i18n: I18n;
importTimeout("i18n", import("./i18n"), (mod) => (i18n = mod));

import type { Modal } from "./modal";
export type { Modal };
export let modal: Modal;
importTimeout("modal", import("./modal"), (mod) => (modal = mod.default));

import type { Parser } from "./parser";
export type { Parser };
export let parser: Parser;
importTimeout("parser", import("./parser"), (mod) => (parser = mod.default));

import type { Toast } from "./toast";
export type { Toast };
export let toast: Toast;
importTimeout("toast", import("./toast"), (mod) => (toast = mod.default));

import type { Typing } from "./typing";
export type { Typing };
export let typing: Typing;
importTimeout("typing", import("./typing"), (mod) => (typing = mod.default));

// External Libraries

/**
 * @see {@link https://highlightjs.org/usage/}
 */
export let hljs: typeof import("highlight.js").default;
importTimeout("hljs", import("./hljs"), (mod) => (hljs = mod.default));

/**
 * @see {@link https://lodash.com/docs}
 */
export let lodash: typeof window._;
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
