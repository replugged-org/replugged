import { Injector /*, Logger*/ } from "@replugged";
import type React from "react";
import type { Store } from "src/renderer/modules/common/flux";
import { getByProps, getByStoreName } from "src/renderer/modules/webpack";

const injector = new Injector();
//const logger = Logger.coremod("UtilityClasses");
const html = document.documentElement;

interface TabBarItemProps {
  id: string;
  "aria-controls"?: string;
}

interface TabBarItemType extends React.Component<TabBarItemProps> {
  render(): React.ReactElement<TabBarItemProps>;
}

// Re-adds the tab bar item's ID as an always-present attribute
function tabBarItemId(): void {
  const TabBarModule = getByProps<{ TabBar: { Item: { prototype: TabBarItemType } } }>("TabBar");
  if (!TabBarModule) {
    throw new Error("Failed to find TabBar module!");
  }

  injector.after(
    TabBarModule.TabBar.Item.prototype,
    "render",
    function (this: TabBarItemType, _, res) {
      if (typeof this.props.id === "string") {
        res.props["aria-controls"] = `${this.props.id.replace(/\s+/g, "-").toLowerCase()}-tab`;
      }
      return res;
    },
  );
}

interface ClientThemesBackgroundStore extends Store {
  gradientPreset: {
    id: number;
  };
}
type ThemeIDMap = Record<string, number> & Record<number, string>;

function onNitroThemeChange(store: ClientThemesBackgroundStore, ThemeIDMap: ThemeIDMap): void {
  if (!store.gradientPreset) {
    html.removeAttribute("data-nitro-theme");
  } else {
    const theme = ThemeIDMap[store.gradientPreset.id];
    html.setAttribute("data-nitro-theme", theme);
  }
}

// Adds the currently active nitro theme as a class on the html element
function nitroThemeClass(): void {
  const ClientThemesBackgroundStore = getByStoreName<ClientThemesBackgroundStore>(
    "ClientThemesBackgroundStore",
  );
  if (!ClientThemesBackgroundStore) {
    throw new Error("Failed to find ClientThemesBackgroundStore!");
  }
  const ThemeIDMap = getByProps<ThemeIDMap>("MINT_APPLE");
  if (!ThemeIDMap) {
    throw new Error("Failed to find ThemeIDs module!");
  }

  // update theme attribute when theme changes
  ClientThemesBackgroundStore.addChangeListener(() => {
    onNitroThemeChange(ClientThemesBackgroundStore, ThemeIDMap);
  });
  onNitroThemeChange(ClientThemesBackgroundStore, ThemeIDMap);
}

export function start(): void {
  tabBarItemId();
  nitroThemeClass();
}

export function stop(): void {
  injector.uninjectAll();
}
