import { React } from "@common";
import type { ContextMenuProps } from "@components/ContextMenu";
import type {
  ContextItem,
  ContextMenuTypes,
  GetContextItem,
  RawContextItem,
} from "../../../types/coremods/contextMenu";
import { Logger } from "../../modules/logger";
import { getByProps } from "../../modules/webpack";

const logger = Logger.api("ContextMenu");

export const menuItems = {} as Record<
  ContextMenuTypes,
  Array<{ getItem: GetContextItem; sectionId: number | undefined; indexInSection: number }>
>;

/**
 * Converts data into a React element. Any elements or falsy value will be returned as is
 * @param raw The data to convert
 * @returns The converted item
 */
function makeItem(raw: RawContextItem | ContextItem | undefined | void): ContextItem | undefined {
  // Occasionally React won't be loaded when this function is ran, so we don't return anything
  if (!React) return undefined;

  if (!raw) {
    // If something falsy is passed, let it through
    // Discord just skips over them too
    return raw as ContextItem | undefined;
  }
  if (React.isValidElement(raw)) {
    // We can't construct something that's already made
    return raw as ContextItem | undefined;
  }

  const { type, ...props } = raw;
  if (props.children) {
    props.children = props.children.map((child: RawContextItem | ContextItem | undefined) =>
      makeItem(child),
    );
  }

  return React.createElement(type as React.FC, props as Record<string, unknown>);
}

/**
 * Add an item to any context menu
 * @param navId The id of the menu you want to insert to
 * @param getItem A function that creates and returns the menu item
 * @param sectionId The number of the section to add to. Defaults to replugged's section
 * @param indexInSection The index in the section to add to. Defaults to the end position
 * @returns A callback to de-register the function
 */
export function addContextMenuItem(
  navId: ContextMenuTypes,
  getItem: GetContextItem,
  sectionId: number | undefined,
  indexInSection: number,
): () => void {
  if (!menuItems[navId]) menuItems[navId] = [];

  menuItems[navId].push({ getItem, sectionId, indexInSection });
  return () => removeContextMenuItem(navId, getItem);
}

/**
 * Remove an item from a context menu
 * @param navId The id of the menu the function was registered to
 * @param getItem The function to remove
 * @returns
 */
export function removeContextMenuItem(navId: ContextMenuTypes, getItem: GetContextItem): void {
  const items = menuItems[navId];

  menuItems[navId] = items.filter((item) => item.getItem !== getItem);
}

type ContextMenuData = ContextMenuProps["ContextMenu"] & {
  children: React.ReactElement | React.ReactElement[];
  data: Array<Record<string, unknown>>;
  navId: ContextMenuTypes;
  plugged?: boolean;
};

/**
 * @internal
 * @hidden
 */
export function _insertMenuItems(menu: ContextMenuData): void {
  const { navId } = menu;

  // No items to insert
  if (!menuItems[navId]) return;

  // Already inserted items
  // If this isn't here, another group of items is added every update
  if (menu.plugged) return;

  // We delay getting the items until now, as importing at the start of the file causes Discord to hang
  // Using `await import(...)` is undesirable because the new items will only appear once the menu is interacted with
  const { MenuGroup } = getByProps<Record<string, React.ComponentType>>([
    "Menu",
    "MenuItem",
    "MenuGroup",
  ])!;

  if (!MenuGroup) return;

  // The data as passed as Arguments from the calling function, so we just grab what we want from it
  const data = menu.data[0];

  const repluggedGroup = <MenuGroup />;
  repluggedGroup.props.id = "replugged";
  repluggedGroup.props.children = [];

  // Add in the new menu items right above the DevMode Copy ID
  // If the user doesn't have DevMode enabled, the new items will be at the bottom
  if (!Array.isArray(menu.children)) menu.children = [menu.children];
  const hasCopyId = menu.children
    .at(-1)
    ?.props?.children?.props?.id?.startsWith("devmode-copy-id-");
  if (hasCopyId) {
    menu.children.splice(-1, 0, repluggedGroup);
  } else {
    menu.children.push(repluggedGroup);
  }

  menuItems[navId].forEach((item) => {
    try {
      const res = makeItem(item.getItem(data, menu)) as ContextItem & { props: { id?: string } };

      if (res?.props) {
        // add in unique ids
        res.props.id = `${res.props.id || "repluggedItem"}-${Math.random()
          .toString(36)
          .substring(2)}`;
      }

      if (!Array.isArray(menu.children)) menu.children = [menu.children];
      const section =
        typeof item.sectionId === "undefined" ? repluggedGroup : menu.children.at(item.sectionId);
      if (!section) return logger.error("Couldn't find section", item.sectionId, menu.children);
      section.props.children.splice(item.indexInSection, 0, res);
    } catch (err) {
      logger.error("Error while running GetContextItem function", err, item.getItem);
    }
  });

  menu.plugged = true;
}
