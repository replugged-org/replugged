import { loadStyleSheet } from "../util";
import type { RepluggedTheme } from "../../types";
import type { AddonSettings } from "src/types/addon";
import { init } from "../apis/settings";

const themeElements = new Map<string, HTMLLinkElement>();

/**
 * @hidden
 */
export const themes = new Map<string, RepluggedTheme>();
let disabled: string[];
const settings = await init<AddonSettings>("themes");

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
 * Load a theme, adding its stylesheet to the DOM
 * @param id Theme ID (RDNN)
 */
export function load(id: string): void {
  if (!themes.has(id)) {
    throw new Error(`Theme not found: ${id}`);
  }
  unload(id);

  const theme = themes.get(id)!;
  const el = loadStyleSheet(`replugged://theme/${theme.path}/${theme.manifest.main}`);
  themeElements.set(id, el);
}

/**
 * Load all themes, adding their stylesheets to the DOM. Disabled themes are not loaded.
 */
export function loadAll(): void {
  for (const id of themes.keys()) {
    if (!disabled.includes(id)) {
      load(id);
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
 * Reload a theme to apply changes
 */
export function reload(id: string): void {
  unload(id);
  load(id);
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
  await window.RepluggedNative.themes.uninstall(id);
  unload(id);
  themes.delete(id);
}

export function getDisabled(): string[] {
  return settings.get("disabled", []);
}
