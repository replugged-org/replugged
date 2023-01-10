import { loadStyleSheet } from "../util";
import type { RepluggedTheme } from "../../types";

const themeElements = new Map<string, HTMLLinkElement>();

/**
 * @hidden
 */
export const themes = new Map<string, RepluggedTheme>();
let disabled: string[] = [];

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
  disabled = await window.RepluggedNative.themes.listDisabled();
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

export async function enable(id: string): Promise<void> {
  if (!themes.has(id)) {
    throw new Error(`Theme "${id}" does not exist.`);
  }
  await window.RepluggedNative.themes.enable(id);
  load(id);
}

export async function disable(id: string): Promise<void> {
  if (!themes.has(id)) {
    throw new Error(`Theme "${id}" does not exist.`);
  }
  await window.RepluggedNative.themes.disable(id);
  unload(id);
}
