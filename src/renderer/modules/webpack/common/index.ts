import { ModuleExports } from "../../../../types";
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
        error("Replugged", "CommonModules", void 0, `Could not find module "${name}"`);
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

export let channels: typeof import("./channels").default;
importTimeout("channels", import("./channels"), (mod) => (channels = mod.default));

export let constants: typeof import("./constants");
importTimeout("constants", import("./constants"), (mod) => (constants = mod));

// export let contextMenu: typeof import("./contextMenu");
// importTimeout("contextMenu", import("./contextMenu"), (mod) => (contextMenu = mod.default));

export let flux: typeof import("./flux").default;
importTimeout("flux", import("./flux"), (mod) => (flux = mod.default));

export let fluxDispatcher: typeof import("./fluxDispatcher").default;
importTimeout(
  "fluxDispatcher",
  import("./fluxDispatcher"),
  (mod) => (fluxDispatcher = mod.default),
);

export let guilds: typeof import("./guilds").default;
importTimeout("guilds", import("./guilds"), (mod) => (guilds = mod.default));

export let hljs: typeof import("./hljs").default;
importTimeout("hljs", import("./hljs"), (mod) => (hljs = mod.default));

export let messages: typeof import("./messages").default;
importTimeout("messages", import("./messages"), (mod) => (messages = mod.default));

// export let modal: typeof import("./modal").default;
// importTimeout("modal", import("./modal"), (mod) => (modal = mod.default));

export let React: typeof import("./react").default;
importTimeout("React", import("./react"), (mod) => (React = mod.default));

// export let router: typeof import("./router").default;
// importTimeout("router", import("./router"), (mod) => (router = mod.default));

export let spotify: typeof import("./spotify").default;
importTimeout("spotify", import("./spotify"), (mod) => (spotify = mod.default));

export let spotifySocket: typeof import("./spotifySocket").default;
importTimeout("spotifySocket", import("./spotifySocket"), (mod) => (spotifySocket = mod.default));

export let typing: typeof import("./typing").default;
importTimeout("typing", import("./typing"), (mod) => (typing = mod.default));

await Promise.allSettled(modulePromises);
