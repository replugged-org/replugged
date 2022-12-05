// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import { RepluggedPlugin } from "../../types";
import { Awaitable } from "../../types/util";
import { MiniInjector } from "../modules/injector";
import { Logger, error } from "../modules/logger";

type PluginWrapper = RepluggedPlugin & {
  context: {
    injector: MiniInjector;
    logger: Logger;
    exports: Record<string, unknown>;
  };
  start: () => Awaitable<void>;
  stop: () => Awaitable<void>;
  patchPlaintext: () => void;
};

export const plugins = new Map<string, PluginWrapper>();
export const pluginExports = new Map<string, unknown>();

export async function load(plugin: RepluggedPlugin): Promise<void> {
  const renderer = await import(`replugged://plugin/${plugin.path}/${plugin.manifest.renderer}`);
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
    start: (): Awaitable<void> => renderer.start(pluginWrapper.context),
    stop: (): Awaitable<void> => renderer.stop(pluginWrapper.context),
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
    await plugin?.start?.();
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
    await plugin?.stop?.();
  } catch (e: unknown) {
    error("Plugin", plugin?.manifest.name ?? id, void 0, e);
  }
}

export async function stopAll(): Promise<void> {
  await Promise.all([...plugins.keys()].map((id) => stop(id)));
}

export function runPlaintextPatches(): void {}

export async function reload(id: string): Promise<void> {
  const plugin = plugins.get(id);
  await plugin?.stop?.();
  plugins.delete(id);
}
