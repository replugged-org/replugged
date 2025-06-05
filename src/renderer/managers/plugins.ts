// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import type { AddonSettings } from "src/types/addon";
import type { PlaintextPatch, PluginExports, RepluggedPlugin } from "../../types";
import { init } from "../apis/settings";
import { Logger } from "../modules/logger";
import { patchPlaintext } from "../modules/webpack/plaintext-patch";
import { loadStyleSheet } from "../util";

const logger = Logger.api("Plugins");
const settings = init<AddonSettings>("plugins");

interface PluginWrapper extends RepluggedPlugin {
  exports: PluginExports | undefined;
}

/**
 * @hidden
 */
export const pluginNatives = new Map<string, Record<string, (...args: unknown[]) => unknown>>();
export const plugins = new Map<string, PluginWrapper>();
const running = new Set<string>();

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
  const plugin = plugins.get(id);
  if (!plugin) {
    throw new Error(`Plugin "${id}" does not exist or is not loaded`);
  }
  return plugin.exports;
}

function register(plugin: RepluggedPlugin): void {
  const existingExports = plugins.get(plugin.manifest.id)?.exports;
  plugins.set(plugin.manifest.id, {
    ...plugin,
    exports: existingExports,
  });
}

/**
 * Load all plugins
 *
 * @remarks
 * You may need to reload Discord after adding a new plugin before it's available.
 */

export function loadAll(): void {
  window.RepluggedNative.plugins.list().forEach(register);
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
      throw new Error(`Plugin "${id}" does not exist or is not loaded`);
    }
    if (running.has(plugin.manifest.id)) {
      throw new Error(`Plugin "${id}" is already running`);
    }

    if (plugin.manifest.native)
      pluginNatives.set(plugin.manifest.id, RepluggedNative.plugins.getNative(plugin.path));

    if (plugin.manifest.renderer) {
      await Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Plugin "${id}" took too long to start`)), 5_000),
        ),
        (async () => {
          const pluginExports = await import(
            `replugged://plugin/${plugin.path}/${plugin.manifest.renderer}?t=${Date.now()}`
          );
          plugin.exports = pluginExports;
          await pluginExports.start?.();
          if (plugin.hasCSS) {
            if (styleElements.has(plugin.manifest.id)) {
              // Remove old style element in case it wasn't removed properly
              styleElements.get(plugin.manifest.id)?.remove();
            }

            const el = loadStyleSheet(
              `replugged://plugin/${plugin.path}/${plugin.manifest.renderer?.replace(
                /\.js$/,
                ".css",
              )}`,
            );
            styleElements.set(plugin.manifest.id, el);
          }
        })(),
      ]);
    }

    running.add(plugin.manifest.id);
    logger.log(`Plugin started: ${plugin.manifest.name}`);
  } catch (e) {
    logger.error(`Error starting plugin ${plugin?.manifest.name}`, e);
  }
}

/**
 * Start all plugins
 *
 * @remarks
 * Plugins must be loaded first with {@link register} or {@link loadAll}
 */
export async function startAll(): Promise<void> {
  const disabled: string[] = settings.get("disabled", []);
  const list = [...plugins.keys()].filter((x) => !disabled.includes(x));
  await Promise.allSettled(list.map(start));
}

/**
 * Stop a plugin
 * @param id Plugin ID (RDNN)
 */
export async function stop(id: string): Promise<void> {
  const plugin = plugins.get(id);
  try {
    if (!plugin) {
      throw new Error(`Plugin "${id}" does not exist or is not loaded`);
    }
    if (!running.has(id)) {
      throw new Error(`Plugin "${id}" is not running`);
    }

    await plugin.exports?.stop?.();

    if (styleElements.has(plugin.manifest.id)) {
      styleElements.get(plugin.manifest.id)?.remove();
      styleElements.delete(plugin.manifest.id);
    }

    running.delete(plugin.manifest.id);
    logger.log(`Plugin stopped: ${plugin.manifest.name}`);
  } catch (e) {
    logger.error(`Error stopping plugin ${plugin?.manifest.name}`, e);
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
export function runPlaintextPatches(): void {
  const disabled: string[] = settings.get("disabled", []);
  const list = [...plugins.values()].filter((x) => !disabled.includes(x.manifest.id));

  for (const plugin of list) {
    if (!plugin.manifest.plaintextPatches) continue;

    // This is a bit of a hack, plaintext patches are built in ESM, but we need to run it in a CJS context
    try {
      const code = RepluggedNative.plugins.getPlaintextPatches(plugin.path);
      let patches: { default: PlaintextPatch[] } = { default: [] };

      if (code) {
        const wrap = (src: string): string =>
          `((module) => {\n${src}return module.exports})({exports:{}})\n//# sourceURL=replugged://plugin/${plugin.manifest.id}/plaintextPatches.js?t=${Date.now()}`;

        let codeCjs = code.replace(/export\s+default\s+/g, "module.exports = ");
        codeCjs = codeCjs.replace(/export[\s+]?\{([^}]+)\}[;]?/g, (_: string, exports: string) =>
          exports
            .split(",")
            .map((exp) => exp.split(" as ").map((x) => x.trim()))
            .map(([orig, alias]) => `module.exports.${alias || orig} = ${orig};`)
            .join("\n"),
        );

        try {
          // eslint-disable-next-line no-eval
          patches = (0, eval)(wrap(codeCjs));
        } catch (err) {
          logger.error(`Error evaluating plaintext patches for ${plugin.manifest.id}`, err);
        }
      }

      patchPlaintext(patches.default, plugin.manifest.id);
    } catch (err) {
      logger.error(`Error applying plaintext patches for ${plugin.manifest.id}`, err);
    }
  }
}

/**
 * Reload a plugin to apply changes
 * @param id Plugin ID (RDNN)
 *
 * @remarks
 * Some plugins may require Discord to be reloaded to apply changes.
 */
export async function reload(id: string): Promise<void> {
  const plugin = plugins.get(id) || Array.from(plugins.values()).find((x) => x.path === id);
  if (!plugin) {
    logger.error(`Plugin "${id}" does not exist or is not loaded`);
    return;
  }
  await stop(plugin.manifest.id);
  plugins.delete(plugin.manifest.id);
  const newPlugin = window.RepluggedNative.plugins.get(plugin.path);
  if (newPlugin) {
    register(newPlugin);
    await start(newPlugin.manifest.id);
  } else {
    logger.error(`Plugin "${plugin.manifest.id}" unloaded but no longer exists`);
  }
}

export async function enable(id: string): Promise<void> {
  if (!plugins.has(id)) {
    throw new Error(`Plugin "${id}" does not exist.`);
  }
  const disabled = settings.get("disabled", []);
  settings.set(
    "disabled",
    disabled.filter((x) => x !== id),
  );
  await start(id);
}

export async function disable(id: string): Promise<void> {
  if (!plugins.has(id)) {
    throw new Error(`Plugin "${id}" does not exist.`);
  }
  const disabled = settings.get("disabled", []);
  settings.set("disabled", [...disabled, id]);
  await stop(id);
}

export async function uninstall(id: string): Promise<void> {
  if (!plugins.has(id)) {
    throw new Error(`Plugin "${id}" does not exist.`);
  }
  const plugin = plugins.get(id)!;
  await stop(id);
  plugins.delete(id);
  await window.RepluggedNative.plugins.uninstall(plugin.path);
}

export function getDisabled(): string[] {
  return settings.get("disabled", []);
}
