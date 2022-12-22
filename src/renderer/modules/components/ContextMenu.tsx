import { React } from '../webpack/common';
import { ObjectExports, ReactComponent } from '../../../types';
import { filters, getFunctionBySource, waitForModule } from '../webpack/index';

export interface MenuType {
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
}

const mod = await waitForModule(filters.bySource("♫ ⊂(｡◕‿‿◕｡⊂) ♪"))

// const modId = getModule(filters.bySource("menuitemcheckbox"), { raw: true })?.id;
// const source = sourceStrings[modId!];

// todo: Finish Populating Menu Components
const Menu = {
  ContextMenu: getFunctionBySource("getContainerProps", mod as ObjectExports),
  // MenuSeparator: getFunctionBySource((m) => m.name === "MenuSeparator", mod as ObjectExports),
} as MenuType;

export default Menu;
