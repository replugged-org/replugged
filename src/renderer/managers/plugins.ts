// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import { RepluggedPlugin } from "../../types";
import { MiniInjector } from "../modules/injector";
import { Logger, error, log } from "../modules/logger";

type PluginWrapper = RepluggedPlugin & {
  context: {
    injector: MiniInjector;
    logger: Logger;
    exports: Record<string, unknown>;
  };
  start: () => Promise<void>;
  stop: () => Promise<void>;
  patchPlaintext: () => void;
};

export const plugins = new Map<string, PluginWrapper>();
export const pluginExports = new Map<string, unknown>();

export async function load(plugin: RepluggedPlugin): Promise<void> {
  const renderer = await import(
    `replugged://plugin/${plugin.path}/${plugin.manifest.renderer}?t=${Date.now()}}`
  );
  const pluginLogger = new Logger("Plugin", plugin.manifest.name);
  const localExports: Record<string, unknown> = {};
  pluginExports.set(plugin.manifest.id, localExports);
  const pluginWrapper: PluginWrapper = Object.freeze({
    ...plugin,
    context: {
      injector: new MiniInjector(),
      logger: pluginLogger,
      exports: localExports,
      // need `settings`
    },
    start: async (): Promise<void> => {
      await renderer.start?.(pluginWrapper.context);
      log("Plugin", plugin.manifest.name, void 0, "Plugin started");
    },
    stop: async (): Promise<void> => {
      await renderer.stop?.(pluginWrapper.context);
      log("Plugin", plugin.manifest.name, void 0, "Plugin stopped");
    },
    patchPlaintext: () => renderer.patchPlaintext(pluginWrapper.context),
  });
  plugins.set(plugin.manifest.id, pluginWrapper);
}

export async function loadAll(): Promise<void> {
  await Promise.allSettled((await window.RepluggedNative.plugins.list()).map((p) => load(p)));
}

export async function start(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    await plugin?.start();
  } catch (e: unknown) {
    error("Plugin", plugin?.manifest.name ?? id, void 0, e);
  }
}

export async function startAll(): Promise<void> {
  await Promise.all([...plugins.keys()].map((id) => start(id)));
}

export async function stop(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    await plugin?.stop();
  } catch (e: unknown) {
    error("Plugin", plugin?.manifest.name ?? id, void 0, e);
  }
}

export async function stopAll(): Promise<void> {
  await Promise.all([...plugins.keys()].map((id) => stop(id)));
}

export function runPlaintextPatches(): void {}

export async function get(pluginName: string): Promise<RepluggedPlugin | null> {
  return await list().then((x) => x.find((p) => p.manifest.id === pluginName) || null);
}

export async function list(): Promise<RepluggedPlugin[]> {
  return await window.RepluggedNative.plugins.list();
}

export async function reload(id: string): Promise<void> {
  const plugin = plugins.get(id);
  if (!plugin) {
    error("Plugin", id, void 0, "Plugin does not exist or is not loaded");
    return;
  }
  await plugin?.stop?.();
  plugins.delete(id);
  const newPlugin = await get(id);
  if (newPlugin) {
    await load(newPlugin);
    await start(newPlugin.manifest.id);
  } else {
    error("Plugin", id, void 0, "Plugin unloaded but no longer exists");
  }
}
