// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import { loadStyleSheet } from "../util";
import type { PluginExports, RepluggedPlugin } from "../../types";
import { error, log } from "../modules/logger";
import { patchPlaintext } from "../modules/webpack";

interface PluginWrapper extends RepluggedPlugin {
  exports: PluginExports | undefined;
}

/**
 * @hidden
 */
export const plugins = new Map<string, PluginWrapper>();

const styleElements = new Map<string, HTMLLinkElement>();

/**
 * Get the exports of a plugin.
 * @param id Plugin ID
 * @returns Exports of the plugin.
 *
 * @remarks
 * This is primarily intended to shorten plaintext patches that need to access exported
 * functions or variables from their respective plugins.
 * Instead of writing `replugged.plugins.plugins.get("id.here").exports`,
 * developers can write `replugged.plugins.getExports("id.here")`.
 */
export function getExports(id: string): PluginExports | undefined {
  return plugins.get(id)!.exports;
}

function register(plugin: RepluggedPlugin): void {
  plugins.set(plugin.manifest.id, {
    ...plugin,
    exports: undefined,
  });
}

/**
 * Load all plugins
 *
 * @remarks
 * You may need to reload Discord after adding a new plugin before it's available.
 */
export async function loadAll(): Promise<void> {
  (await window.RepluggedNative.plugins.list()).forEach(register);
}

/**
 * Start a plugin
 * @param id Plugin ID (RDNN)
 *
 * @remarks
 * Plugin must be loaded first with {@link register} or {@link loadAll}
 */
export async function start(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    if (!plugin) {
      throw new Error("Plugin does not exist or is not loaded");
    }

    if (plugin.manifest.renderer) {
      plugin.exports = await import(
        `replugged://plugin/${plugin.path}/${plugin.manifest.renderer}?t=${Date.now()}}`
      );
      await plugin.exports!.start?.();
    }

    const el = loadStyleSheet(
      `replugged://plugin/${plugin.path}/${plugin.manifest.renderer?.replace(/\.js$/, ".css")}`,
    );
    styleElements.set(plugin.path, el);

    log("Plugin", plugin.manifest.name, void 0, "Plugin started");
  } catch (e: unknown) {
    error("Plugin", plugin?.manifest.name ?? id, void 0, e);
  }
}

/**
 * Start all plugins
 *
 * @remarks
 * Plugins must be loaded first with {@link register} or {@link loadAll}
 */
export async function startAll(): Promise<void> {
  await Promise.allSettled([...plugins.keys()].map(start));
}

/**
 * Stop a plugin
 * @param id Plugin ID (RDNN)
 */
export async function stop(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    if (!plugin) {
      throw new Error("Plugin does not exist or is not loaded");
    }

    await plugin.exports?.stop?.();

    if (styleElements.has(plugin.path)) {
      styleElements.get(plugin.path)?.remove();
      styleElements.delete(plugin.path);
    }

    log("Plugin", plugin.manifest.name, void 0, "Plugin stopped");
  } catch (e: unknown) {
    error("Plugin", plugin?.manifest.name ?? id, void 0, e);
  }
}

/**
 * Stop all plugins
 */
export async function stopAll(): Promise<void> {
  await Promise.allSettled([...plugins.keys()].map(stop));
}

/**
 * @hidden
 * @internal
 */
export async function runPlaintextPatches(): Promise<void> {
  await Promise.allSettled(
    [...plugins.values()].map(async (plugin) => {
      if (plugin.manifest.plaintextPatches) {
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
    }),
  );
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
  await stop(id);
  plugins.delete(id);
  const newPlugin = await window.RepluggedNative.plugins.get(id);
  if (newPlugin) {
    register(newPlugin);
    await start(newPlugin.manifest.id);
  } else {
    error("Plugin", id, void 0, "Plugin unloaded but no longer exists");
  }
}
