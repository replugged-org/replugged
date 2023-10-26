import type React from "react";
import components from "../common/components";

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

export type modType = Record<
  | "Menu"
  | "MenuSeparator"
  | "MenuCheckboxItem"
  | "MenuRadioItem"
  | "MenuControlItem"
  | "MenuGroup"
  | "MenuItem",
  React.ComponentType
>;

const Menu = {
  ItemColors,
  ContextMenu: components.Menu,
  MenuSeparator: components.MenuSeparator,
  MenuCheckboxItem: components.MenuCheckboxItem,
  MenuRadioItem: components.MenuRadioItem,
  MenuControlItem: components.MenuControlItem,
  MenuGroup: components.MenuGroup,
  MenuItem: components.MenuItem,
} as ContextMenuType;

export default Menu;
