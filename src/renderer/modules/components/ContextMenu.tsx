import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type React from "react";
import components from "../common/components";
import { sourceStrings } from "../webpack/patch-load";

const ItemColors = {
  DEFAULT: "default",
  BRAND: "brand",
  DANGER: "danger",
  PREMIUM: "premium",
  PREMIUM_GRADIENT: "premium-gradient",
  SUCCESS: "success",
} as const;

export interface MenuProps {
  navId: string;
  variant?: "fixed" | "flexible";
  hideScroller?: boolean;
  className?: string;
  // Menus can have various children types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any> | Array<React.ReactElement<any>>;
  onClose: () => void;
  onSelect?: () => void;
  "aria-label"?: string;
}

interface ItemProps {
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean;
  role: string;
  id: string;
  tabIndex: number;
  onFocus: () => void;
  onMouseEnter: () => void;
}

interface ExtraItemProps {
  hasSubmenu?: boolean;
  isFocused: boolean;
  menuItemProps: ItemProps;
  onClose?: () => void;
}

interface MenuCheckboxItemProps {
  id: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  label?: React.FC<MenuCheckboxItemProps & ExtraItemProps> | React.ReactNode;
  checked?: boolean;
  subtext?: React.ReactNode;
  disabled?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  focusedClassName?: string;
}

interface MenuCompositeControlItemProps {
  id: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  disabled?: boolean;
  showDefaultFocus?: boolean;
  children: React.ReactNode;
  interactive?: boolean;
}

interface MenuControlItemProps {
  id: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  label?: React.ReactNode;
  control: (
    data: {
      onClose: () => void;
      disabled: boolean | undefined;
      isFocused: boolean;
    },
    ref?: React.Ref<{ activate: () => boolean; blur: () => void; focus: () => void }>,
  ) => React.ReactElement;
  disabled?: boolean;
  showDefaultFocus?: boolean;
}

interface MenuCustomItemProps {
  id: string;
  render: (data: {
    color: (typeof ItemColors)[keyof typeof ItemColors];
    disabled: boolean;
    isFocused: boolean;
  }) => React.ReactNode;
  navigable?: boolean;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  disabled?: boolean;
  keepItemStyles?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
  dontCloseOnActionIfHoldingShiftKey?: boolean;
  dontCloseOnAction?: boolean;
}

interface MenuGroupProps {
  children?: React.ReactNode;
  label?: string;
  className?: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
}

interface MenuItemProps {
  id: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  label?: React.FC<MenuItemProps & ExtraItemProps> | React.ReactNode;
  icon?: React.ComponentType<unknown>;
  iconLeft?: React.FC<MenuItemProps & ExtraItemProps> | React.ReactNode;
  iconLeftSize?: "xxs" | "xs" | "sm" | "md" | "lg" | "custom";
  hint?: React.FC<MenuItemProps & ExtraItemProps> | React.ReactNode;
  subtext?: React.ReactNode;
  disabled?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
  onFocus?: () => void;
  className?: string;
  focusedClassName?: string;
  subMenuIconClassName?: string;
  dontCloseOnActionIfHoldingShiftKey?: boolean;
  dontCloseOnAction?: boolean;
  iconProps?: Record<string, unknown>;
  sparkle?: boolean;
}

interface MenuRadioItemProps {
  id: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  label?: React.FC<MenuRadioItemProps & ExtraItemProps> | React.ReactNode;
  checked?: boolean;
  subtext?: React.ReactNode;
  disabled?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
}

interface MenuSubmenuItemProps extends MenuItemProps {
  children: React.ReactNode;
  subMenuClassName?: string;
}

interface MenuSubmenuListItemProps extends MenuItemProps {
  children: React.ReactNode;
  childRowHeight: number;
  onChildrenScroll?: () => void;
  listClassName?: string;
}

export interface ContextMenuType {
  ContextMenu: React.FC<MenuProps>;
  ItemColors: typeof ItemColors;
  MenuCheckboxItem: React.FC<MenuCheckboxItemProps>;
  MenuControlItem: React.FC<MenuControlItemProps | MenuCompositeControlItemProps>;
  MenuGroup: React.FC<MenuGroupProps>;
  MenuItem: React.FC<
    MenuItemProps | MenuCustomItemProps | MenuSubmenuListItemProps | MenuSubmenuItemProps
  >;
  MenuRadioItem: React.FC<MenuRadioItemProps>;
  MenuSeparator: React.FC;
}

const componentMap: Record<string, keyof Omit<ContextMenuType, "ContextMenu" | "ItemColors">> = {
  separator: "MenuSeparator",
  checkbox: "MenuCheckboxItem",
  radio: "MenuRadioItem",
  control: "MenuControlItem",
  groupstart: "MenuGroup",
  customitem: "MenuItem",
} as const;

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
  ItemColors,
  ContextMenu: getFunctionBySource(components, "getContainerProps"),
} as ContextMenuType;

for (const [, identifier, type] of source) {
  Menu[componentMap[type]] = menuComponents[identifier];
}

export default Menu;
