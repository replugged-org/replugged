import { loadStyleSheet } from "../util";
import { Theme } from "../../types/addon";
import { RepluggedTheme } from "@replugged";

const themeElements = new Map<string, HTMLLinkElement>();

const themes = new Map<string, Theme>();
let disabled: string[] = [];

/**
 * Load metadata for all themes that are added to the themes folder but not yet loaded, such as newly added themes.
 *
 * @remarks
 * This does not apply the themes, only loads their metadata. You can call {@link load} or {@link loadAll} to apply a theme.
 */
export async function loadMissing(): Promise<void> {
  for (const theme of await window.RepluggedNative.themes.list()) {
    themes.set(theme.path, theme.manifest);
  }
  disabled = await window.RepluggedNative.themes.listDisabled();
}

/**
 * Unload a theme, removing its stylesheet from the DOM
 * @param themeName Theme ID (RDNN)
 */
export function unload(themeName: string): void {
  if (themeElements.has(themeName)) {
    themeElements.get(themeName)?.remove();
    themeElements.delete(themeName);
  }
}

/**
 * Load a theme, adding its stylesheet to the DOM
 * @param themeName Theme ID (RDNN)
 */
export function load(themeName: string): void {
  if (!themes.has(themeName)) {
    throw new Error(`Theme not found: ${themeName}`);
  }
  unload(themeName);

  const theme = themes.get(themeName)!;
  const el = loadStyleSheet(`replugged://theme/${themeName}/${theme.main}`);
  themeElements.set(themeName, el);
}

/**
 * Load all themes, adding their stylesheets to the DOM. Disabled themes are not loaded.
 */
export function loadAll(): void {
  for (const themeName of themes.keys()) {
    if (!disabled.includes(themeName)) {
      load(themeName);
    }
  }
}

/**
 * Unload all themes, removing their stylesheets from the DOM
 */
export function unloadAll(): void {
  for (const themeName of themeElements.keys()) {
    unload(themeName);
  }
}

/**
 * Get a theme
 *
 * @remarks
 * This may include themes that are not available until Discord is reloaded.
 */
export async function get(path: string): Promise<RepluggedTheme | null> {
  return await list().then((x) => x.find((p) => p.manifest.id === path) || null);
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
export function reload(themeName: string): void {
  unload(themeName);
  load(themeName);
}
