import type { ThemeSettings } from "src/types/addon";
import type { RepluggedTheme } from "../../types";
import { init } from "../apis/settings";
import { Logger } from "../modules/logger";
import { loadStyleSheet } from "../util";

const logger = Logger.manager("Themes");

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
export function loadMissing(): void {
  for (const theme of window.RepluggedNative.themes.list()) {
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

function loadVariant(id: string, variant: "main" | "splash"): void {
  if (!themes.has(id)) {
    throw new Error(`Theme not found: ${id}`);
  }

  const theme = themes.get(id)!;
  const themeSettings = settings.get(id, { chosenPreset: undefined });

  let el: HTMLLinkElement;

  try {
    if (theme.manifest.presets?.length) {
      if (!themeSettings.chosenPreset) {
        themeSettings.chosenPreset = theme.manifest.presets.find((x) => x.default)?.id;
        if (!themeSettings.chosenPreset) {
          // Fallback to first preset
          themeSettings.chosenPreset = theme.manifest.presets[0]?.id;
        }
        settings.set(id, themeSettings);
      }

      if (themeSettings.chosenPreset) {
        el = loadStyleSheet(
          `replugged://theme/${theme.path}/presets/${themeSettings.chosenPreset}/${variant}.css`,
        );
      } else {
        logger.error(`No valid preset found for theme ${id}`);
        return;
      }
    } else if (theme.manifest[variant]) {
      el = loadStyleSheet(`replugged://theme/${theme.path}/${theme.manifest[variant]}`);
    } else {
      logger.error(`Theme ${id} has neither ${variant} CSS nor presets.`);
      return;
    }

    unload(id);
    themeElements.set(id, el);
  } catch (error) {
    logger.error(`Failed to load theme ${id}:`, String(error));
  }
}

/**
 * Load a theme's main variant, adding its stylesheet to the DOM
 * @param id Theme ID (RDNN)
 */
export function load(id: string): void {
  loadVariant(id, "main");
}

/**
 * Load a theme's splash variant, adding its stylesheet to the DOM
 * @param id Theme ID (RDNN)
 */
export function loadSplash(id: string): void {
  loadVariant(id, "splash");
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
export function get(path: string): RepluggedTheme | undefined {
  return list().find((p) => p.manifest.id === path);
}

/**
 * List all themes
 *
 * @remarks
 * This may include themes that are not available until Discord is reloaded.
 */
export function list(): RepluggedTheme[] {
  return window.RepluggedNative.themes.list();
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
