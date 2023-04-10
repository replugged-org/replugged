// import ContextMenu from "../../renderer/modules/components/ContextMenu";
import { ReactComponent } from "../util";

// const {
//   // ContextMenu,
//   MenuCheckboxItem,
//   MenuControlItem,
//   MenuGroup,
//   MenuItem,
//   MenuRadioItem,
//   MenuSeparator,
// } = ContextMenu;

export interface RawContextItem {
  type: ReactComponent<unknown>;
  children?: Array<RawContextItem | ContextItem | undefined>;
  action?(): unknown;

  [key: string]: unknown;
}

export type ContextItem =
  | typeof MenuSeparator
  | typeof MenuGroup
  | typeof MenuItem
  | typeof MenuCheckboxItem
  | typeof MenuRadioItem
  | typeof MenuControlItem;

export type GetContextItem = (
  data: any,
  menu: typeof ContextMenu.ContextMenu,
) => RawContextItem | ContextItem | undefined;
