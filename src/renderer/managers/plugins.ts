// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import { RepluggedPlugin } from "../../types";
import { Awaitable } from "../../types/util";
import { MiniInjector } from "../modules/injector";
import { Logger, error } from "../modules/logger";

type PluginWrapper = RepluggedPlugin &
  RepluggedPlugin["manifest"] & {
    context: {
      injector: MiniInjector;
      logger: Logger;
    };
    start: () => Awaitable<void>;
    stop: () => Awaitable<void>;
    patchPlaintext: () => void;
  };

export const plugins = new Map<string, PluginWrapper>();
export const pluginExports = new Map<string, unknown>();

export async function load(plugin: RepluggedPlugin): Promise<void> {
  const renderer = await import(`replugged://plugin/${plugin.id}/${plugin.manifest.renderer}`);
  const pluginLogger = new Logger("Plugin", plugin.manifest.name);
  const localExports = {};
  pluginExports.set(plugin.manifest.id, localExports);
  const pluginWrapper: PluginWrapper = Object.freeze({
    ...plugin,
    ...plugin.manifest,
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
    error("Plugin", plugin?.name ?? id, void 0, e);
  }
}

export async function startAll(): Promise<void> {
  for (const id of plugins.keys()) {
    await start(id);
  }
}

export async function stop(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    await plugin?.stop?.();
  } catch (e: unknown) {
    error("Plugin", plugin?.name ?? id, void 0, e);
  }
}

export async function stopAll(): Promise<void> {
  for (const id of plugins.keys()) {
    await stop(id);
  }
}

export function runPlaintextPatches(): void {}

export async function reload(id: string): Promise<void> {
  const plugin = plugins.get(id);
  await plugin?.stop?.();
  plugins.delete(id);
}
