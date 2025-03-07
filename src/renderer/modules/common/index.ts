import { error } from "../logger";

const modulePromises: Array<() => Promise<void>> = [];

function importTimeout<T>(
  name: string,
  moduleImport: Promise<T>,
  cb: (mod: T) => Promise<void>,
): void {
  modulePromises.push(
    () =>
      new Promise<void>((res, rej) => {
        const timeout = setTimeout(() => {
          error("CommonModules", name, void 0, `Could not find module "${name}"`);
          rej(new Error(`Module not found: "${name}`));
        }, 10_000);
        void moduleImport
          .then(async (mod) => {
            await cb(mod);
            clearTimeout(timeout);
            res();
          })
          .catch((err) => {
            error("CommonModules", name, void 0, `Failed to import module "${name}"`, err);
            rej(err);
          });
      }),
  );
}

// Stores

import type { Channels } from "./channels";
export type { Channels };
export let channels: Channels;
importTimeout("channels", import("./channels"), async (mod) => {
  channels = await mod.default;
});

import type { Guilds } from "./guilds";
export type { Guilds };
export let guilds: Guilds;
importTimeout("guilds", import("./guilds"), async (mod) => {
  guilds = await mod.default;
});

import type { Messages } from "./messages";
export type { Messages };
export let messages: Messages;
importTimeout("messages", import("./messages"), async (mod) => {
  messages = await mod.default;
});

import type { Users } from "./users";
export type { Users };
export let users: Users;
importTimeout("users", import("./users"), async (mod) => {
  users = await mod.default;
});

// Utilities

import type { API } from "./api";
export type { API };
export let api: API;
importTimeout("api", import("./api"), async (mod) => {
  api = await mod.default;
});

import type Components from "./components";
export type Components = Awaited<typeof Components>;
export let components: Components;
importTimeout("components", import("./components"), async (mod) => {
  components = await mod.default;
});

import Constants from "./constants";
export type Constants = Awaited<typeof Constants>;
export let constants: Constants;
importTimeout("constants", import("./constants"), async (mod) => {
  constants = await mod.default;
});

import type { ContextMenu } from "./contextMenu";
export type { ContextMenu };
export let contextMenu: ContextMenu;
importTimeout("contextMenu", import("./contextMenu"), async (mod) => {
  contextMenu = await mod.default;
});

import type { Flux } from "./flux";
export type { Flux };
export let flux: Flux;
importTimeout("flux", import("./flux"), async (mod) => {
  flux = await mod.default;
});

import type { FluxDispatcher } from "./fluxDispatcher";
export type { FluxDispatcher };
export let fluxDispatcher: FluxDispatcher;
importTimeout("fluxDispatcher", import("./fluxDispatcher"), async (mod) => {
  fluxDispatcher = await mod.default;
});

import type { FluxHooks } from "./fluxHooks";
export type { FluxHooks };
export let fluxHooks: FluxHooks;
importTimeout("fluxHooks", import("./fluxHooks"), async (mod) => {
  fluxHooks = await mod.default;
});

import type { I18n } from "./i18n";
export type { I18n };
export let i18n: I18n;
importTimeout("i18n", import("./i18n"), async (mod) => {
  i18n = await mod.default;
});

import type { Modal } from "./modal";
export type { Modal };
export let modal: Modal;
importTimeout("modal", import("./modal"), async (mod) => {
  modal = await mod.default;
});

import type { Parser } from "./parser";
export type { Parser };
export let parser: Parser;
importTimeout("parser", import("./parser"), async (mod) => {
  parser = await mod.default;
});

import type { Toast } from "./toast";
export type { Toast };
export let toast: Toast;
importTimeout("toast", import("./toast"), (mod) => {
  toast = mod.default;
  return Promise.resolve();
});

import type { Typing } from "./typing";
export type { Typing };
export let typing: Typing;
importTimeout("typing", import("./typing"), async (mod) => {
  typing = await mod.default;
});

// External Libraries

/**
 * @see {@link https://highlightjs.org/usage/}
 */
export let hljs: Awaited<typeof import("highlight.js").default>;
importTimeout("hljs", import("./hljs"), async (mod) => {
  hljs = await mod.default;
});

/**
 * @see {@link https://lodash.com/docs}
 */
export let lodash: typeof window._;
importTimeout("lodash", import("./lodash"), async (mod) => {
  lodash = await mod.default;
});

/**
 * @see {@link https://momentjs.com/docs/}
 */
export let moment: Awaited<typeof import("moment")>;
importTimeout("moment", import("./moment"), async (mod) => {
  moment = await mod.default;
});

/**
 * @see {@link https://react.dev/}
 */
export let React: Awaited<typeof import("react")>;
importTimeout("React", import("./react"), async (mod) => {
  React = await mod.default;
});

/**
 * @see {@link https://react.dev/reference/react-dom}
 */
export let ReactDOM: Awaited<typeof import("react-dom")>;
importTimeout("ReactDOM", import("./react-dom"), async (mod) => {
  ReactDOM = await mod.default;
});

/**
 * @internal
 * @hidden
 */
export const ready = (): Promise<void> =>
  new Promise<void>((resolve) =>
    Promise.allSettled(modulePromises.map((promiseFn) => promiseFn())).then(() => resolve()),
  );
