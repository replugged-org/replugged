import type React from "react";
import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, sourceStrings, waitForModule } from "../webpack";

interface MenuProps {
  navId: string;
  children: React.ReactNode;
  onClose: () => void;
  variant?: string;
  className?: string;
  style?: React.CSSProperties;
  hideScroller?: boolean;
  onSelect?: () => void;
  "aria-label"?: string;
}

interface MenuGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  color?: string;
}

interface MenuItemProps {
  id: string;
  color?: string;
  label?: string;
  icon?: React.ReactNode;
  showIconFirst?: boolean;
  imageUrl?: string;
  hint?: React.ReactNode;
  subtext?: React.ReactNode;
  disabled?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
  onFocus?: () => void;
  className?: string;
  focusedClassName?: string;
  subMenuIconClassName?: string;
  dontCloseOnActionIfHoldingShiftKey?: boolean;
  iconProps?: Record<string, unknown>;
  sparkle?: boolean;
}

interface MenuSubmenuListItemProps {
  children: React.ReactNode;
  childRowHeight: number;
  onChildrenScroll?: () => void;
  listClassName?: string;
}

interface MenuSubmenuItemProps {
  children: React.ReactNode;
  subMenuClassName?: string;
}

interface MenuCustomItemProps {
  id: string;
  render: (data: { color: string; disabled: boolean; isFocused: boolean }) => React.ReactNode;
  color?: string;
  disabled?: boolean;
  keepItemStyles?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
  dontCloseOnActionIfHoldingShiftKey?: boolean;
}

interface MenuCheckboxItemProps {
  id: string;
  color?: string;
  label?: string;
  checked?: boolean;
  subtext?: string;
  disabled?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  focusedClassName?: string;
}

interface MenuRadioItemProps {
  id: string;
  color?: string;
  label?: string;
  checked?: boolean;
  subtext?: string;
  disabled?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
}

interface MenuControlItemProps {
  id: string;
  color?: string;
  label?: string;
  control: (
    data: {
      onClose: () => void;
      disabled: boolean;
      isFocused: boolean;
    },
    ref?: React.RefObject<{ activate: () => boolean; blur: () => void; focus: () => void }>,
  ) => React.ReactElement;
  disabled?: boolean;
  showDefaultFocus?: boolean;
}

interface MenuCompositeControlItemProps {
  id: string;
  children: React.ReactNode;
  interactive?: boolean;
  color?: string;
  disabled?: boolean;
  showDefaultFocus?: boolean;
}

export type ContextMenuType = Record<string, unknown> & {
  ContextMenu: React.ComponentType<MenuProps>;
  MenuSeparator: React.ComponentType;
  MenuGroup: React.ComponentType<MenuGroupProps>;
  MenuItem: React.ComponentType<
    MenuItemProps | MenuCustomItemProps | MenuSubmenuListItemProps | MenuSubmenuItemProps
  >;
  MenuCheckboxItem: React.ComponentType<MenuCheckboxItemProps>;
  MenuRadioItem: React.ComponentType<MenuRadioItemProps>;
  MenuControlItem: React.ComponentType<MenuControlItemProps | MenuCompositeControlItemProps>;
};

const componentMap: Record<string, string> = {
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
