import type React from "react";
import type { ObjectExports, ReactComponent } from "../../../types";
import { filters, getFunctionBySource, sourceStrings, waitForModule } from "../webpack";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ContextMenuProps = {
  ContextMenu: {
    navId: string;
    onClose?: () => void;
    className?: string;
    style?: React.CSSProperties;
    hideScroller?: boolean;
    onSelect?: () => void;
  };

  MenuSeparator: unknown;

  MenuGroup: unknown;

  MenuItem: {
    id: string;
    label: string;
    render?: React.ComponentType;
    onChildrenScroll?: () => void;
    childRowHeight?: number;
    listClassName?: string;
  };

  MenuCheckboxItem: { id: string };

  MenuRadioItem: { id: string };

  MenuControlItem: ReactComponent<{ id: string }>;
};

export type ContextMenuType = {
  [K in keyof ContextMenuProps]: ReactComponent<ContextMenuProps[K]>;
};

export type ContextMenuElements = {
  [K in keyof ContextMenuProps]: React.ReactElement<ContextMenuProps[K]>;
};

const componentMap: Record<string, keyof ContextMenuType> = {
  separator: "MenuSeparator",
  checkbox: "MenuCheckboxItem",
  radio: "MenuRadioItem",
  control: "MenuControlItem",
  groupstart: "MenuGroup",
  customitem: "MenuItem",
};

const menuMod = await waitForModule(filters.bySource("♫ ⊂(｡◕‿‿◕｡⊂) ♪"));

const rawMod = await waitForModule(filters.bySource("menuitemcheckbox"), { raw: true });
const source = sourceStrings[rawMod?.id].matchAll(
  /if\(\w+\.type===(\w+)(?:\.\w+)?\).+?type:"(.+?)"/gs,
);

const menuComponents = Object.values(menuMod)
  .filter((m) => /^function.+\(e?\){(\s+)?return null(\s+)?}$/.test(m?.toString?.()))
  .reduce((components, component) => {
    components[component.name] = component;
    return components;
  }, {});

const Menu = {
  ContextMenu: getFunctionBySource(menuMod as ObjectExports, "getContainerProps"),
} as ContextMenuType;

for (const [, identifier, type] of source) {
  Menu[componentMap[type]] = menuComponents[identifier];
}

export default Menu;
