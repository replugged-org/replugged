import type {
  ContextItem,
  GetContextItem,
  RawContextItem,
  navId,
} from "../../../types/coremods/contextMenu";
import { Logger } from "../../modules/logger";
import { getByProps } from "../../modules/webpack";
import type ReactType from "react";

const logger = Logger.api("ContextMenu");

export const menuItems = {} as Record<navId, GetContextItem[]>;

/**
 * Converts data into a react element. Any elements or falsy value will be returned as is
 * @param raw The data to convert
 * @returns The converted item
 */
function makeItem(raw: RawContextItem | ContextItem | undefined): ContextItem | undefined {
  // Importing React at the top of the file causes an import loop that hangs discord
  const React = getByProps(
    "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED",
    "createElement",
    "isValidElement",
  ) as unknown as typeof ReactType;

  if (!raw) {
    // If something falsy is passed, let it through
    // Discord just skips over them too
    return raw;
  }
  if (React.isValidElement(raw)) {
    // We can't construct something that's already made
    return raw as unknown as ContextItem;
  }

  raw = raw as RawContextItem;

  const { type, ...props } = raw;
  if (props.children) {
    props.children = props.children.map((child: RawContextItem | ContextItem | undefined) =>
      makeItem(child),
    );
  }

  return React.createElement(type, props as Record<string, unknown>) as unknown as ContextItem;
}

/**
 * Add an item to any context menu
 * @param navId The id of the menu you want to insert to
 * @param getItem A function that creates and returns the menu item
 * @returns A callback to de-register the function
 */
export function addContextMenuItem(navId: navId, getItem: GetContextItem): () => void {
  if (!menuItems[navId]) menuItems[navId] = [];

  menuItems[navId].push(getItem);
  return () => removeContextMenuItem(navId, getItem);
}

/**
 * Remove an item from a context menu
 * @param navId The id of the menu the function was registered to
 * @param getItem The function to remove
 * @returns
 */
export function removeContextMenuItem(navId: navId, getItem: GetContextItem): void {
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
  data: { 0: Record<string, unknown> };
  navId: navId;
  children: JSX.Element[];
}): void {
  const { navId } = menu;
  console.log(navId)

  // No items to insert
  if (!menuItems[navId]) return;

  // Already inserted items
  // If this isn't here, another group of items is added every update
  if (menu.children.at(-2)?.props?.name === "replugged") return;

  // We delay getting the items until now, as importing at the start of the file causes discord to hang
  // Using `await import(...)` is undesirable because the new items will only appear once the menu is interacted with
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
  const { ContextMenu, MenuGroup } = getByProps(["Menu", "MenuItem", "MenuGroup"]) as any;

  // The data as passed as Arguments from the calling function, so we just grab what we want from it
  const data = menu.data[0];

  const repluggedGroup = <MenuGroup></MenuGroup>;
  repluggedGroup.props.name = "replugged";
  repluggedGroup.props.children = [];

  menuItems[navId].forEach((getItem) => {
    try {
      repluggedGroup.props.children.push(
        makeItem(getItem(data, menu as unknown as typeof ContextMenu)),
      );
    } catch (err) {
      logger.error("Error while running GetContextItem function", err, getItem);
    }
  });

  // Add in the new menu items right above the DevMode Copy ID
  // If the user doesn't have DevMode enabled, the new items will be at the bottom
  menu.children.splice(-1, 0, repluggedGroup);
}
