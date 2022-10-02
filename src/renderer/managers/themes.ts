const themeElements = new Map<string, HTMLLinkElement>();

export async function load (themeName: string) {
  const e = document.createElement('link');
  // Make this look through the manifest
  e.href = `replugged://theme/${themeName}/index.css`;
  e.rel = 'stylesheet';
  themeElements.set(themeName, e);
  document.head.appendChild(e);
}

export function unload (themeName: string) {
  if (themeElements.has(themeName)) {
    themeElements.get(themeName)?.remove();
    themeElements.delete(themeName);
  }
}

export async function loadAll () {
  for (const theme of await window.RepluggedNative.themes.listEnabled()) {
    console.log(theme);
  }
}

export function unloadAll () {
  for (const themeName of themeElements.keys()) {
    unload(themeName);
  }
}

export function reload (themeName: string) {
  unload(themeName);
  reload(themeName);
}
