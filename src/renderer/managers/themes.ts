import { loadStyleSheet } from "../util";
import type { ReCelledTheme } from "../../types";
import type { AddonSettings } from "src/types/addon";
import { init } from "../apis/settings";
import * as logger from "../modules/logger";

const themeElements = new Map<string, HTMLLinkElement>();

/**
 * @hidden
 */
export const themes = new Map<string, ReCelledTheme>();
let disabled: string[];
const settings = init<AddonSettings>("themes");

/**
 * Load metadata for all themes that are added to the themes folder but not yet loaded, such as newly added themes.
 *
 * @remarks
 * This does not apply the themes, only loads their metadata. You can call {@link load} or {@link loadAll} to apply a theme.
 */
export async function loadMissing(): Promise<void> {
  for (const theme of await window.ReCelledNative.themes.list()) {
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
  if (!theme.manifest.main) {
    logger.error("Manager", `Theme ${id} does not have a main variant.`);
    return;
  }
  unload(id);

  const el = loadStyleSheet(`recelled://theme/${theme.path}/${theme.manifest.main}`);
  themeElements.set(id, el);
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
  if (!theme.manifest.splash) {
    logger.error("Manager", `Theme ${id} does not have a splash variant.`);
    return;
  }
  unload(id);

  const el = loadStyleSheet(`recelled://theme/${theme.path}/${theme.manifest.splash}`);
  themeElements.set(id, el);
}

/**
 * Load all themes' main variants, adding their stylesheets to the DOM. Disabled themes are not loaded.
 */
export function loadAll(): void {
  for (const id of themes.keys()) {
    if (!disabled.includes(id) && themes.get(id)?.manifest.main) {
      load(id);
    }
  }
}

/**
 * Load all themes' splash variants, adding their stylesheets to the DOM. Disabled themes are not loaded.
 */
export function loadAllSplash(): void {
  for (const id of themes.keys()) {
    if (!disabled.includes(id) && themes.get(id)?.manifest.splash) {
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
export async function get(path: string): Promise<ReCelledTheme | undefined> {
  return await list().then((x) => x.find((p) => p.manifest.id === path));
}

/**
 * List all themes
 *
 * @remarks
 * This may include themes that are not available until Discord is reloaded.
 */
export async function list(): Promise<ReCelledTheme[]> {
  return await window.ReCelledNative.themes.list();
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
  await window.ReCelledNative.themes.uninstall(theme.path);
}

export function getDisabled(): string[] {
  return settings.get("disabled", []);
}
