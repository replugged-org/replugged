import { filters, getFunctionBySource, waitForModule, waitForProps } from "@webpack";
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

const rawMod = await waitForModule(filters.bySource('role:"menuitemcheckbox"'), { raw: true });
const matches = Array.from(
  sourceStrings[rawMod?.id]?.matchAll(/if\(\w+\.type===\w+\.(\w+)(?:\.\w+)?\).+?type:"(.+?)"/gs) ??
    [],
);

const menuComponentsMod = await waitForProps<Record<string, () => null>>(
  matches.map(([, identifier]) => identifier),
  { raw: false },
);

const menuStr = "Menu API only allows";
const mod = await waitForModule(filters.bySource(menuStr));

const Menu = {
  ContextMenu: getFunctionBySource(mod, menuStr),
} as CustomContextMenuType;

for (const [, identifier, type] of matches) {
  if (componentMap[type]) {
    Menu[componentMap[type]] = menuComponentsMod[identifier];
  }
}

export default Menu;
