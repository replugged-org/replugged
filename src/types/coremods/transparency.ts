export const VIBRANCY_SELECT_OPTIONS = [
  { label: "Titlebar", value: "titlebar" },
  { label: "Selection", value: "selection" },
  { label: "Menu", value: "menu" },
  { label: "Popover", value: "popover" },
  { label: "Sidebar", value: "sidebar" },
  { label: "Header", value: "header" },
  { label: "Sheet", value: "sheet" },
  { label: "Window", value: "window" },
  { label: "HUD", value: "hud" },
  { label: "Fullscreen UI", value: "fullscreen-ui" },
  { label: "Tooltip", value: "tooltip" },
  { label: "Content", value: "content" },
  { label: "Under Window", value: "under-window" },
  { label: "Under Page", value: "under-page" },
] as const;
export type VibrancyType = (typeof VIBRANCY_SELECT_OPTIONS)[number]["value"];

export const BACKGROUND_MATERIALS = ["auto", "none", "mica", "acrylic", "tabbed"] as const;
export type BackgroundMaterialType = (typeof BACKGROUND_MATERIALS)[number];
