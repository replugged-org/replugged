import type React from "react";
import { filters, getFunctionBySource, waitForModule } from "../webpack";
import { sourceStrings } from "../webpack/patch-load";

const ItemColors = {
  DEFAULT: "default",
  BRAND: "brand",
  DANGER: "danger",
  PREMIUM: "premium",
  PREMIUM_GRADIENT: "premium-gradient",
  SUCCESS: "success",
} as const;

interface MenuProps {
  navId: string;
  children: React.ReactElement | React.ReactElement[];
  onClose: () => void;
  variant?: "fixed" | "flexible";
  className?: string;
  style?: React.CSSProperties;
  hideScroller?: boolean;
  onSelect?: () => void;
  "aria-label"?: string;
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
  label?: string;
  icon?: React.ComponentType<unknown>;
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

interface MenuSubmenuListItemProps extends MenuItemProps {
  children: React.ReactNode;
  childRowHeight: number;
  onChildrenScroll?: () => void;
  listClassName?: string;
}

interface MenuSubmenuItemProps extends MenuItemProps {
  children: React.ReactNode;
  subMenuClassName?: string;
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
}

interface MenuCheckboxItemProps {
  id: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
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
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  label?: string;
  checked?: boolean;
  subtext?: string;
  disabled?: boolean;
  action?: React.MouseEventHandler<HTMLDivElement>;
}

interface MenuControlItemProps {
  id: string;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  label?: string;
  control: (
    data: {
      onClose: () => void;
      disabled: boolean;
      isFocused: boolean;
    },
    ref?: React.Ref<{ activate: () => boolean; blur: () => void; focus: () => void }>,
  ) => React.ReactElement;
  disabled?: boolean;
  showDefaultFocus?: boolean;
}

interface MenuCompositeControlItemProps {
  id: string;
  children: React.ReactNode;
  interactive?: boolean;
  color?: (typeof ItemColors)[keyof typeof ItemColors];
  disabled?: boolean;
  showDefaultFocus?: boolean;
}

export interface ContextMenuProps {
  ContextMenu: MenuProps;
  MenuSeparator: unknown;
  MenuGroup: MenuGroupProps;
  MenuItem: MenuItemProps | MenuCustomItemProps | MenuSubmenuListItemProps | MenuSubmenuItemProps;
  MenuCheckboxItem: MenuCheckboxItemProps;
  MenuRadioItem: MenuRadioItemProps;
  MenuControlItem: MenuControlItemProps | MenuCompositeControlItemProps;
}

export type ContextMenuComponents = {
  [K in keyof ContextMenuProps]: React.FC<ContextMenuProps[K]>;
};

export type ContextMenuElements = {
  [K in keyof ContextMenuProps]: React.ReactElement<ContextMenuProps[K]>;
};

export type ContextMenuType = ContextMenuComponents & {
  ItemColors: typeof ItemColors;
};

const componentMap: Record<string, keyof ContextMenuComponents> = {
  separator: "MenuSeparator",
  checkbox: "MenuCheckboxItem",
  radio: "MenuRadioItem",
  control: "MenuControlItem",
  groupstart: "MenuGroup",
  customitem: "MenuItem",
} as const;

const menuMod = await waitForModule<Record<string, React.ComponentType>>(
  filters.bySource("♫ ⊂(｡◕‿‿◕｡⊂) ♪"),
);

const rawMod = await waitForModule(filters.bySource("menuitemcheckbox"), { raw: true });
const source = sourceStrings[rawMod?.id].matchAll(
  /if\(\w+\.type===(\w+)(?:\.\w+)?\).+?type:"(.+?)"/gs,
);

const menuComponents = Object.values(menuMod)
  .filter((m) => /^function.+\(e?\){(\s+)?return null(\s+)?}$/.test(m?.toString?.()))
  .reduce<Record<string, React.ComponentType>>((components, component) => {
    components[component.name] = component;
    return components;
  }, {});

const Menu = {
  ItemColors,
  ContextMenu: getFunctionBySource(menuMod, "getContainerProps"),
} as ContextMenuType;

for (const [, identifier, type] of source) {
  // @ts-expect-error Doesn't like that the generic changes
  Menu[componentMap[type]] = menuComponents[identifier];
}

export default Menu;
