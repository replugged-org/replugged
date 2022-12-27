import { React } from "../webpack/common";
import { ObjectExports, ReactComponent } from "../../../types";
import { filters, getFunctionBySource, sourceStrings, waitForModule } from "../webpack/index";
import { AnyFunction } from "../../../types/util";

export type MenuType = Record<string, unknown> & {
  ContextMenu: ReactComponent<{
    navId: string;
    onClose?: () => void;
    className?: string;
    style?: React.CSSProperties;
    hideScroller?: boolean;
    onSelect?: () => void;
  }>;

  MenuSeparator: React.ComponentType;

  MenuGroup: ReactComponent<unknown>;

  MenuItem: ReactComponent<{
    id: string;
    label: string;
    render?: React.ComponentType;
    onChildrenScroll?: () => void;
    childRowHeight?: number;
    listClassName?: string;
  }>;

  MenuCheckboxItem: ReactComponent<{ id: string }>;

  MenuRadioItem: ReactComponent<{ id: string }>;

  MenuControlItem: ReactComponent<{ id: string }>;
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
const source = sourceStrings[rawMod?.id!].matchAll(/if\(\w+\.type===\w+\.(\w+)\).+?type:"(.+?)"/g);

const Menu = {
  ContextMenu: getFunctionBySource("getContainerProps", menuMod as ObjectExports),
} as MenuType;

for (const [, identifier, type] of source) {
  Menu[componentMap[type]] = (rawMod.exports as Record<string, AnyFunction | undefined>)[
    identifier
  ];
}

export default Menu;
