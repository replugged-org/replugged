import type { ThemeSettings } from "src/types/addon";
import type { RepluggedTheme } from "../../types";
import { init } from "../apis/settings";
import * as logger from "../modules/logger";
import { loadStyleSheet } from "../util";

const themeElements = new Map<string, HTMLLinkElement>();

/**
 * @hidden
 */
export const themes = new Map<string, RepluggedTheme>();
let disabled: string[];
export const settings = init<ThemeSettings>("themes");

/**
 * Load metadata for all themes that are added to the themes folder but not yet loaded, such as newly added themes.
 *
 * @remarks
 * This does not apply the themes, only loads their metadata. You can call {@link load} or {@link loadAll} to apply a theme.
 */
export async function loadMissing(): Promise<void> {
  for (const theme of await window.RepluggedNative.themes.list()) {
    themes.set(theme.manifest.id, theme);
  }
  disabled = settings.get("disabled", []);
}

/**
 * Unload a theme, removing its stylesheet from the DOM
 * @param id Theme ID (RDNN)
 */
export function unload(id: string): void {
  if (themeElements.has(id)) {
    themeElements.get(id)?.remove();
    themeElements.delete(id);
  }
}

/**
 * Load a theme's main variant, adding its stylesheet to the DOM
 * @param id Theme ID (RDNN)
 */
export function load(id: string): void {
  if (!themes.has(id)) {
    throw new Error(`Theme not found: ${id}`);
  }

  const theme = themes.get(id)!;
  const themeSettings = settings.get(id, { chosenMainPreset: undefined });

  let el: HTMLLinkElement;

  try {
    if (theme.manifest.presets?.length) {
      if (!themeSettings.chosenMainPreset) {
        themeSettings.chosenMainPreset = theme.manifest.presets.find((x) => x.default)?.main;
        if (!themeSettings.chosenMainPreset) {
          // Fallback to first preset
          themeSettings.chosenMainPreset = theme.manifest.presets[0]?.main;
        }
        settings.set(id, themeSettings);
      }

      if (themeSettings.chosenMainPreset) {
        el = loadStyleSheet(`replugged://theme/${theme.path}/${themeSettings.chosenMainPreset}`);
      } else {
        logger.error("Manager", `No valid preset found for theme ${id}`);
        return;
      }
    } else if (theme.manifest.main) {
      el = loadStyleSheet(`replugged://theme/${theme.path}/${theme.manifest.main}`);
    } else {
      logger.error("Manager", `Theme ${id} has neither main CSS nor presets.`);
      return;
    }

    unload(id);
    themeElements.set(id, el);
  } catch (error) {
    logger.error("Manager", `Failed to load theme ${id}:`, String(error));
  }
}

/**
 * Load a theme's splash variant, adding its stylesheet to the DOM
 * @param id Theme ID (RDNN)
 */
export function loadSplash(id: string): void {
  if (!themes.has(id)) {
    throw new Error(`Theme not found: ${id}`);
  }

  const theme = themes.get(id)!;
  const themeSettings = settings.get(id, { chosenSplashPreset: undefined });

  let el: HTMLLinkElement;

  try {
    if (theme.manifest.presets?.length) {
      if (!themeSettings.chosenSplashPreset) {
        themeSettings.chosenSplashPreset = theme.manifest.presets.find((x) => x.default)?.splash;
        if (!themeSettings.chosenSplashPreset) {
          // Fallback to first preset
          themeSettings.chosenSplashPreset = theme.manifest.presets[0]?.splash;
        }
        settings.set(id, themeSettings);
      }

      if (themeSettings.chosenSplashPreset) {
        el = loadStyleSheet(`replugged://theme/${theme.path}/${themeSettings.chosenSplashPreset}`);
      } else {
        logger.error("Manager", `No valid preset found for theme ${id}`);
        return;
      }
    } else if (theme.manifest.main) {
      el = loadStyleSheet(`replugged://theme/${theme.path}/${theme.manifest.main}`);
    } else {
      logger.error("Manager", `Theme ${id} has neither main CSS nor presets.`);
      return;
    }

    unload(id);
    themeElements.set(id, el);
  } catch (error) {
    logger.error("Manager", `Failed to load Splash theme ${id}:`, String(error));
  }
}

/**
 * Load all themes' main variants, adding their stylesheets to the DOM. Disabled themes are not loaded.
 */
export function loadAll(): void {
  for (const id of themes.keys()) {
    const theme = themes.get(id);
    if (
      !disabled.includes(id) &&
      (theme?.manifest.main || theme?.manifest.presets?.some((p) => p.main))
    ) {
      load(id);
    }
  }
}

/**
 * Load all themes' splash variants, adding their stylesheets to the DOM. Disabled themes are not loaded.
 */
export function loadAllSplash(): void {
  for (const id of themes.keys()) {
    const theme = themes.get(id);
    if (
      !disabled.includes(id) &&
      (theme?.manifest.splash || theme?.manifest.presets?.some((p) => p.splash))
    ) {
      loadSplash(id);
    }
  }
}

/**
 * Unload all themes, removing their stylesheets from the DOM
 */
export function unloadAll(): void {
  for (const id of themeElements.keys()) {
    unload(id);
  }
}

/**
 * Get a theme
 *
 * @remarks
 * This may include themes that are not available until Discord is reloaded.
 */
export async function get(path: string): Promise<RepluggedTheme | undefined> {
  return await list().then((x) => x.find((p) => p.manifest.id === path));
}

/**
 * List all themes
 *
 * @remarks
 * This may include themes that are not available until Discord is reloaded.
 */
export async function list(): Promise<RepluggedTheme[]> {
  return await window.RepluggedNative.themes.list();
}

/**
 * Reload a theme's main variant to apply changes
 */
export function reload(id: string): void {
  unload(id);
  load(id);
}

/**
 * Reload a theme's splash variant to apply changes
 */
export function reloadSplash(id: string): void {
  unload(id);
  loadSplash(id);
}

export function enable(id: string): void {
  if (!themes.has(id)) {
    throw new Error(`Theme "${id}" does not exist.`);
  }
  const disabled = settings.get("disabled", []);
  settings.set(
    "disabled",
    disabled.filter((x) => x !== id),
  );
  load(id);
}

export function disable(id: string): void {
  if (!themes.has(id)) {
    throw new Error(`Theme "${id}" does not exist.`);
  }
  const disabled = settings.get("disabled", []);
  settings.set("disabled", [...disabled, id]);
  unload(id);
}

export async function uninstall(id: string): Promise<void> {
  if (!themes.has(id)) {
    throw new Error(`Theme "${id}" does not exist.`);
  }
  const theme = themes.get(id)!;
  unload(id);
  themes.delete(id);
  await window.RepluggedNative.themes.uninstall(theme.path);
}

export function getDisabled(): string[] {
  return settings.get("disabled", []);
}
