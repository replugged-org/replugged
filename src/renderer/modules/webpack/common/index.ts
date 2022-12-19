//import { ModuleExports } from "@replugged";
//import { error } from "../../logger";
/*
async function wrapImport<T extends ModuleExports>(name: string): Promise<T> {
  return (Promise.race([
    import(`./${name}`)! as Promise<T>,
    new Promise<void>((reject) => setTimeout(() => {
        reject();
      }, 5_000))
  ]) as Promise<T>)
    .catch(() => error("Replugged", "CommonModules", void 0, `Could not find module ${name}`));
}
*

export let channels: typeof import("./channels").default;
//wrapImport("channels").then(mod => channels = mod.default);

export let constants: typeof import("./constants");
//wrapImport("constants").then(mod => constants = mod);

// export let contextMenu: typeof import("./contextMenu");
export let flux: typeof import("./flux").default;
export let fluxDispatcher: typeof import("./fluxDispatcher").default;
export let guilds: typeof import("./guilds").default;
export let hljs: typeof import("./hljs").default;
export let messages: typeof import("./messages").default;
// export let modal: typeof import("./modal").default;
export let react: typeof import("./react").default;
// export let router: typeof import("./router").default;
export let spotify: typeof import("./spotify").default;
export let spotifySocket: typeof import("./spotifySocket").default;
export let typing: typeof import("./typing").default;
/*
contextMenu
flux
fluxDispatcher
guilds
hljs
messages
modal
react
router
spotify
spotifySocket
typing
*/

export { default as channels } from "./channels";
export * as constants from "./constants";
// export { default as contextMenu } from "./contextMenu";
export { default as flux } from "./flux";
export { default as fluxDispatcher } from "./fluxDispatcher";
export { default as guilds } from "./guilds";
export { default as hljs } from "./hljs";
export { default as messages } from "./messages";
// export { default as modal } from "./modal";
export { default as React } from "./react";
// export { default as router } from "./router";
export { default as spotify } from "./spotify";
export { default as spotifySocket } from "./spotifySocket";
export { default as typing } from "./typing";
