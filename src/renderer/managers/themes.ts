import { Theme } from '../../types/addon';

const themeElements = new Map<string, HTMLLinkElement>();

const themes = new Map<string, Theme>();
let disabled: string[] = [];

export async function loadMissing () {
  for (const theme of await window.RepluggedNative.themes.list()) {
    themes.set(theme.id, theme.manifest);
  }
  disabled = await window.RepluggedNative.themes.listDisabled();
}

export function load (themeName: string) {
  if (!themes.has(themeName)) {
    throw new Error(`Theme not found: ${themeName}`);
  }
  const theme = themes.get(themeName) as Theme;
  const e = document.createElement('link');
  e.rel = 'stylesheet';
  // This will need to change a little bit for the splash screen
  e.href = `replugged://theme/${themeName}/${theme.main}`;
  themeElements.set(themeName, e);
  document.head.appendChild(e);
}

export function unload (themeName: string) {
  if (themeElements.has(themeName)) {
    themeElements.get(themeName)?.remove();
    themeElements.delete(themeName);
  }
}

export function loadAll () {
  for (const themeName of themes.keys()) {
    if (!disabled.includes(themeName)) {
      load(themeName);
    }
  }
}

export function unloadAll () {
  for (const themeName of themeElements.keys()) {
    unload(themeName);
  }
}

export function reload (themeName: string) {
  unload(themeName);
  load(themeName);
}
