import { Theme } from "../../types/addon";

const themeElements = new Map<string, HTMLLinkElement>();

const themes = new Map<string, Theme>();
let disabled: string[] = [];

export async function loadMissing(): Promise<void> {
  for (const theme of await window.RepluggedNative.themes.list()) {
    themes.set(theme.path, theme.manifest);
  }
  disabled = await window.RepluggedNative.themes.listDisabled();
}

export function unload(themeName: string): void {
  if (themeElements.has(themeName)) {
    themeElements.get(themeName)?.remove();
    themeElements.delete(themeName);
  }
}

export function load(themeName: string): void {
  if (!themes.has(themeName)) {
    throw new Error(`Theme not found: ${themeName}`);
  }
  unload(themeName);
  const theme = themes.get(themeName)!;
  const e = document.createElement("link");
  e.rel = "stylesheet";
  // This will need to change a little bit for the splash screen
  e.href = `replugged://theme/${themeName}/${theme.main}`;
  themeElements.set(themeName, e);
  document.head.appendChild(e);
}

export function loadAll(): void {
  for (const themeName of themes.keys()) {
    if (!disabled.includes(themeName)) {
      load(themeName);
    }
  }
}

export function unloadAll(): void {
  for (const themeName of themeElements.keys()) {
    unload(themeName);
  }
}

export function reload(themeName: string): void {
  unload(themeName);
  load(themeName);
}
