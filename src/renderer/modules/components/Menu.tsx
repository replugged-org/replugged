import { filters, getFunctionBySource, waitForModule, waitForProps } from "@webpack";
import components from "../common/components";
import { sourceStrings } from "../webpack/patch-load";

import type { MenuItemColors } from "discord-client-types/discord_app/design/components/Menu/web/MenuConstants";
import type * as Design from "discord-client-types/discord_app/design/web";

export interface CustomContextMenuType {
  ContextMenu: Design.Menu;
  ItemColors: MenuItemColors;
  MenuCheckboxItem: Design.MenuCheckboxItem;
  MenuControlItem: Design.MenuControlItem;
  MenuGroup: Design.MenuGroup;
  MenuItem: Design.MenuItem;
  MenuRadioItem: Design.MenuRadioItem;
  MenuSeparator: Design.MenuSeparator;
  MenuSwitchItem: Design.MenuSwitchItem;
}

const componentMap: Record<
  string,
  keyof Omit<CustomContextMenuType, "ContextMenu" | "ItemColors">
> = {
  separator: "MenuSeparator",
  checkbox: "MenuCheckboxItem",
  radio: "MenuRadioItem",
  switch: "MenuSwitchItem",
  control: "MenuControlItem",
  groupstart: "MenuGroup",
  customitem: "MenuItem",
} as const;

const menuConstantsMod = await waitForProps<MenuItemColors>(["brand", "premium-gradient"]);

const rawMod = await waitForModule(filters.bySource("menuitemcheckbox"), { raw: true });
const source = sourceStrings[rawMod?.id].matchAll(
  /if\(\w+\.type===\w+\.(\w+)(?:\.\w+)?\).+?type:"(.+?)"/gs,
);

const menuComponents = Object.entries(components as Record<string, () => null>)
  .filter(([_, m]) => /^function.+\(e?\){(\s+)?return null(\s+)?}$/.test(m?.toString?.()))
  .reduce<Record<string, () => null>>((components, [name, component]) => {
    components[name.substring(0, 2)] = component;
    return components;
  }, {});

const Menu = {
  ItemColors: menuConstantsMod,
  ContextMenu: getFunctionBySource(components, "getContainerProps"),
} as CustomContextMenuType;

for (const [, identifier, type] of source) {
  Menu[componentMap[type]] = menuComponents[identifier];
}

export default Menu;
