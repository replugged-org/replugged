export const VIBRANCY_VALUES = [
  "titlebar",
  "selection",
  "menu",
  "popover",
  "sidebar",
  "header",
  "sheet",
  "window",
  "hud",
  "fullscreen-ui",
  "tooltip",
  "content",
  "under-window",
  "under-page",
] as const;
export type VibrancyType = (typeof VIBRANCY_VALUES)[number];

export const BACKGROUND_MATERIALS = ["auto", "none", "mica", "acrylic", "tabbed"] as const;
export type BackgroundMaterialType = (typeof BACKGROUND_MATERIALS)[number];
