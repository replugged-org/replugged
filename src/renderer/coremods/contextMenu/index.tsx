import type {
  ContextItem,
  GetContextItem,
  RawContextItem,
} from "../../../types/coremods/contextMenu";
import { getByProps } from "../../modules/webpack";
import type ReactType from "react";

export const menuItems = {} as Record<string, GetContextItem[]>; // navId, (id, item)

function makeItem(raw: RawContextItem | ContextItem | undefined): ContextItem | undefined {
  // Importing React at the top of the file causes an import loop that hangs discord
  const React = getByProps(
    "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED",
    "createElement",
  ) as unknown as typeof ReactType;

  if (!raw) {
    // If something falsy is passed, let it through
    // Discord just skips over them too
    return raw;
  }
  if (React.isValidElement(raw)) {
    // We can't construct something that's already made
    return raw;
  }

  raw = raw as RawContextItem;

  const { type, ...props } = raw;
  if (props.children) {
    props.children = props.children.map((child) => makeItem(child));
  }

  return React.createElement(type, props);
}

export function addContextMenuItem(navId: string, getItem: GetContextItem): () => void {
  if (!menuItems[navId]) menuItems[navId] = [];

  menuItems[navId].push(getItem);
  return () => removeContextMenuItem(navId, getItem);
}

export function removeContextMenuItem(navId: string, getItem: GetContextItem): void {
  const items = menuItems[navId];
  const index = items.indexOf(getItem);

  if (index === -1) {
    // Already removed
    return;
  }

  items.splice(index, 1);
}

/**
 * @internal
 * @hidden
 */
export function _insertMenuItems(menu: {
  data: { 0: unknown };
  navId: string;
  children: JSX.Element[];
}): void {
  const { navId } = menu;

  // No items to insert
  if (!menuItems[navId]) return;

  // Already inserted items
  // If this isn't here, another group of items is added every update
  if (menu.children.at(-2)?.props?.name === "replugged") return;

  // We delay getting the items until now, as importing at the start of the file causes discord to hang
  // Using `await import(...)` is undesirable because the new items will only appear once the menu is interacted with
  const { ContextMenu, MenuGroup } = getByProps(["Menu", "MenuItem", "MenuGroup"]);

  // The data as passed as Arguments from the calling function, so we just grab what we want from it
  const data = menu.data[0];

  const repluggedGroup = <MenuGroup></MenuGroup>;
  repluggedGroup.props.name = "replugged";
  repluggedGroup.props.children = [];

  menuItems[navId].forEach((getItem) => {
    repluggedGroup.props.children.push(
      makeItem(getItem(data, menu as unknown as typeof ContextMenu)),
    );
  });

  console.log(repluggedGroup);

  // Add in the new menu items right above the DevMode Copy ID
  // If the user doesn't have DevMode enabled, the new items will be at the bottom
  menu.children.splice(-1, 0, repluggedGroup);
}
