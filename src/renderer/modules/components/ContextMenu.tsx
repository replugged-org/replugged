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

export interface MenuProps {
  navId: string;
  variant?: "fixed" | "flexible";
  hideScroller?: boolean;
  className?: string;
  children: React.ReactElement | React.ReactElement[];
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

const Menu = {
  ContextMenu: components.Menu,
  ItemColors,
  MenuCheckboxItem: components.MenuCheckboxItem,
  MenuControlItem: components.MenuControlItem,
  MenuGroup: components.MenuGroup,
  MenuItem: components.MenuItem,
  MenuRadioItem: components.MenuRadioItem,
  MenuSeparator: components.MenuSeparator,
} as ContextMenuType;

export default Menu;
