// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import { loadStyleSheet } from "../util";
import { PluginExports, RepluggedPlugin } from "../../types";
import { error, log } from "../modules/logger";
import { patchPlaintext } from "../modules/webpack";

type PluginWrapper = RepluggedPlugin & {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  runPlaintextPatches: () => Promise<void>;
};

/**
 * @hidden
 */
export const plugins = new Map<string, PluginWrapper>();
/**
 * @hidden
 */
export const pluginExports = new Map<string, unknown>();

const styleElements = new Map<string, HTMLLinkElement>();

/**
 * Load a plugin
 * @param plugin Plugin class. You can get this from {@link get} or {@link list}
 *
 * @remarks
 * You may need to reload Discord after adding a new plugin before it's available.
 */
export function load(plugin: RepluggedPlugin): void {
  try {
    let renderer: PluginExports;
    const localExports: Record<string, unknown> = {};
    pluginExports.set(plugin.manifest.id, localExports);
    const pluginWrapper: PluginWrapper = Object.freeze({
      ...plugin,
      start: async (): Promise<void> => {
        if (plugin.manifest.renderer) {
          renderer = await import(
            `replugged://plugin/${plugin.path}/${plugin.manifest.renderer}?t=${Date.now()}}`
          );
          await renderer.start?.();
        }

        const el = loadStyleSheet(
          `replugged://plugin/${plugin.path}/${plugin.manifest.renderer?.replace(/\.js$/, ".css")}`,
        );
        styleElements.set(plugin.path, el);

        log("Plugin", plugin.manifest.name, void 0, "Plugin started");
      },
      stop: async (): Promise<void> => {
        await renderer?.stop?.();

        if (styleElements.has(plugin.path)) {
          styleElements.get(plugin.path)?.remove();
          styleElements.delete(plugin.path);
        }

        log("Plugin", plugin.manifest.name, void 0, "Plugin stopped");
      },
      runPlaintextPatches: async () => {
        if (typeof plugin.manifest.plaintextPatches === "string") {
          patchPlaintext(
            (
              await import(
                `replugged://plugin/${plugin.path}/${
                  plugin.manifest.plaintextPatches
                }?t=${Date.now()}`
              )
            ).default,
          );
        }
      },
    });
    plugins.set(plugin.manifest.id, pluginWrapper);
  } catch (e: unknown) {
    error("Plugin", plugin.manifest.id, void 0, "Plugin failed to load\n", e);
  }
}

/**
 * Load all plugins
 *
 * @remarks
 * You may need to reload Discord after adding a new plugin before it's available.
 */
export async function loadAll(): Promise<void> {
  await Promise.allSettled((await window.RepluggedNative.plugins.list()).map((p) => load(p)));
}

/**
 * Start a plugin
 * @param id Plugin ID (RDNN)
 *
 * @remarks
 * Plugin must be loaded first with {@link load} or {@link loadAll}
 */
export async function start(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    await plugin?.start();
  } catch (e: unknown) {
    error("Plugin", plugin?.manifest.name ?? id, void 0, e);
  }
}

/**
 * Start all plugins
 *
 * @remarks
 * Plugins must be loaded first with {@link load} or {@link loadAll}
 */
export async function startAll(): Promise<void> {
  await Promise.allSettled([...plugins.keys()].map((id) => start(id)));
}

/**
 * Stop a plugin
 * @param id Plugin ID (RDNN)
 */
export async function stop(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    await plugin?.stop();
  } catch (e: unknown) {
    error("Plugin", plugin?.manifest.name ?? id, void 0, e);
  }
}

/**
 * Stop all plugins
 */
export async function stopAll(): Promise<void> {
  await Promise.allSettled([...plugins.keys()].map((id) => stop(id)));
}

/**
 * @hidden
 * @internal
 */
export async function runPlaintextPatches(): Promise<void> {
  await Promise.allSettled([...plugins.values()].map((p) => p.runPlaintextPatches()));
}

/**
 * Get a plugin
 *
 * @remarks
 * This may include plugins that are not available until Discord is reloaded.
 */
export async function get(pluginName: string): Promise<RepluggedPlugin | null> {
  return await list().then((x) => x.find((p) => p.manifest.id === pluginName) || null);
}

/**
 * List all plugins
 *
 * @remarks
 * This may include plugins that are not available until Discord is reloaded.
 */
export async function list(): Promise<RepluggedPlugin[]> {
  return await window.RepluggedNative.plugins.list();
}

/**
 * Reload a plugin to apply changes
 * @param id Plugin ID (RDNN)
 *
 * @remarks
 * Some plugins may require Discord to be reloaded to apply changes.
 */
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
    load(newPlugin);
    await start(newPlugin.manifest.id);
  } else {
    error("Plugin", id, void 0, "Plugin unloaded but no longer exists");
  }
}
