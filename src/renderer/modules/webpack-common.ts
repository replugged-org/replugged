import { Filter, ModuleExports, ObjectExports } from "@replugged";
import { filters, getExportsForProps, waitForModule, getFunctionBySource, getBySource } from './webpack';
import {
  Channels,
  ContextMenu,
  Flux,
  FluxDispatcher,
  Guilds,
  HighlightJS,
  Messages,
  Modal,
  Router,
  Spotify,
  SpotifySocket,
  Typing,
} from "src/types/webpack-common";
import { ModalSize, ModalClasses } from "src/types/components";
import type React from "react";
import { error } from "./logger";

async function wrapFilter<T extends ModuleExports>(name: string, filter: Filter): Promise<T> {
  return (await waitForModule(filter, {
    timeout: 5_000,
  }).catch(() => {
    error("Replugged", "CommonModules", void 0, `Could not find module ${name}`);
    return null;
  })) as T;
}

const messages = wrapFilter<Messages>(
  "messages",
  filters.byProps("sendMessage", "editMessage", "deleteMessage"),
);

const typing = wrapFilter<Typing>("typing", filters.byProps("startTyping", "stopTyping"));

const constants = wrapFilter<ModuleExports>("constants", filters.bySource("BASE_URL:")).then(
  (mod) => {
    if (!mod) return null;

    return {
      raw: mod,
      Permissions: getExportsForProps(mod, ["ADMINISTRATOR", "MANAGE_GUILD"]) as Record<
        string,
        bigint
      >,
      Scopes: getExportsForProps(mod, ["BOT", "GUILDS"]) as Record<string, string>,
      RPCErrors: getExportsForProps(mod, ["RATELIMITED", "TOKEN_REVOKED"]) as Record<
        string | number,
        string | number
      >,
      RPCCommands: getExportsForProps(mod, ["AUTHENTICATE", "AUTHORIZE"]) as Record<string, string>,
      RPCEvents: getExportsForProps(mod, ["GUILD_CREATE", "ERROR"]) as Record<string, string>,
      Colors: getExportsForProps(mod, ["GREY1", "GREY2"]) as Record<string, string>,
      Status: getExportsForProps(mod, ["ONLINE", "IDLE"]) as Record<string, string>,
      CSSVariables: getExportsForProps(mod, ["TEXT_NORMAL", "BACKGROUND_PRIMARY"]) as Record<
        string,
        string
      >,
      Paths: getExportsForProps(mod, ["INDEX", "DOWNLOADS"]) as Record<string, string>,
    };
  },
);

const channels = wrapFilter(
  "channels",
  filters.byProps("getChannelId", "getLastSelectedChannelId", "getVoiceChannelId"),
).then((mod) => {
  if (!mod) return;

  return Object.getPrototypeOf(
    getExportsForProps(mod, ["getChannelId", "getLastSelectedChannelId", "getVoiceChannelId"]),
  ) as Channels;
});

const guilds = (async () => {
  const mods = (
    await Promise.all([
      wrapFilter("guilds1", filters.byProps("getGuild", "getGuilds")).then((mod) =>
        Object.getPrototypeOf(mod),
      ),
      wrapFilter("guilds2", filters.byProps("getGuildId", "getLastSelectedGuildId")).then((mod) => {
        if (!mod) return null;

        return Object.getPrototypeOf(
          getExportsForProps(mod, ["getGuildId", "getLastSelectedGuildId"]),
        );
      }),
    ])
  ).filter((x) => x && typeof x === "object") as ObjectExports[];

  return mods.reduce((acc, mod) => ({ ...acc, ...mod }), {}) as Guilds;
})();

const spotify = wrapFilter<Spotify>("spotify", filters.byProps("play", "pause", "inBrowser"));

const spotifySocket = wrapFilter<SpotifySocket>(
  "spotifySocket",
  filters.byProps("getActiveSocketAndDevice", "getPlayerState", "hasConnectedAccount"),
);

const react = wrapFilter<typeof React>(
  "react",
  filters.byProps("__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"),
);

// todo: fix
// const contextMenu = wrapFilter<ContextMenu>(
//   "contextMenu",
//   filters.byProps("openContextMenu", "closeContextMenu"),
// );

const modal = wrapFilter("modal", filters.bySource("onCloseRequest:null!=")).then((mod) => {
  if (!mod) return null;

  const classes = getBySource("().justifyStart") as ModalClasses;

  return {
    openModal: getFunctionBySource("onCloseRequest:null!=", mod as ObjectExports),
    closeModal: getFunctionBySource("onCloseCallback&&", mod as ObjectExports),
    ModalSize,
    Direction: classes?.Direction,
    Align: classes?.Align,
    Justify: classes?.Justify,
    Wrap: classes?.Wrap,
  };
}) as Promise<Modal>;

const flux = wrapFilter<Flux>("flux", filters.byProps("Store", "connectStores"));

const fluxDispatcher = wrapFilter<FluxDispatcher>(
  "fluxDispatcher",
  filters.byProps("_currentDispatchActionType", "_processingWaitQueue"),
);

// todo: fix
// const router = wrapFilter<Router>("router", filters.byProps("BrowserRouter", "Router"));

const hljs = wrapFilter<HighlightJS>("hljs", filters.byProps("initHighlighting", "highlight"));

export interface CommonModules {
  messages: Messages;
  typing: Typing;
  constants: NonNullable<Awaited<typeof constants>>;
  channels: Channels;
  guilds: Guilds;
  spotify: Spotify;
  spotifySocket: SpotifySocket;
  react: typeof React;
  // contextMenu: ContextMenu;
  modal: Modal;
  flux: Flux;
  fluxDispatcher: FluxDispatcher;
  // router: Router;
  hljs: HighlightJS;
}

export default async (): Promise<CommonModules> => ({
  messages: await messages,
  typing: await typing,
  constants: (await constants)!,
  channels: (await channels)!,
  guilds: await guilds,
  spotify: await spotify,
  spotifySocket: await spotifySocket,
  react: await react,
  // contextMenu: await contextMenu,
  modal: await modal,
  flux: await flux,
  fluxDispatcher: await fluxDispatcher,
  // router: await router,
  hljs: await hljs,
});
