import { React, components, lodash } from "@common";
import type { MenuProps } from "@components/ContextMenu";
import type {
  ContextMenuTypes,
  GetContextItem,
  RawContextItem,
} from "../../../types/coremods/contextMenu";
import { Logger } from "../../modules/logger";

const logger = Logger.api("ContextMenu");

export const menuItems: Record<
  string,
  | Array<{ getItem: GetContextItem; sectionId: number | undefined; indexInSection: number }>
  | undefined
> = {};

/**
 * Converts data into a React element. Any elements or falsy value will be returned as is
 * @param raw The data to convert
 * @returns The converted item
 */
function makeItem(raw: ReturnType<GetContextItem>): React.ReactElement | undefined {
  if (!raw) return;
  if (React.isValidElement(raw)) return raw;

  const { type, ...props } = raw as RawContextItem;

  if ("children" in props && props.children) {
    if (Array.isArray(props.children)) {
      props.children = props.children.map((child: ReturnType<GetContextItem>) => makeItem(child));
    } else {
      props.children = makeItem(props.children as ReturnType<GetContextItem>);
    }
  }

  return React.createElement(type as React.FC, props as Record<string, unknown>);
}

/**
 * Add an item to any context menu
 * @param navId The id of the menu you want to insert to
 * @param getItem A function that creates and returns the menu item
 * @param sectionId The number of the section to add to. Defaults to Replugged's section
 * @param indexInSection The index in the section to add to. Defaults to the end position
 * @returns A callback to de-register the function
 */
export function addContextMenuItem(
  navId: ContextMenuTypes,
  getItem: GetContextItem,
  sectionId: number | undefined,
  indexInSection: number,
): () => void {
  menuItems[navId] ||= [];

  menuItems[navId]?.push({ getItem, sectionId, indexInSection });
  return () => removeContextMenuItem(navId, getItem);
}

/**
 * Remove an item from a context menu
 * @param navId The id of the menu the function was registered to
 * @param getItem The function to remove
 * @returns
 */
export function removeContextMenuItem(navId: ContextMenuTypes, getItem: GetContextItem): void {
  menuItems[navId] = menuItems[navId]?.filter((item) => item.getItem !== getItem);
}

type ContextMenuProps = MenuProps & {
  data: Array<Record<string, unknown>>;
};

/**
 * @internal
 * @hidden
 */
export function _insertMenuItems(props: ContextMenuProps): ContextMenuProps {
  const menuItemsPatches = menuItems[props.navId];
  if (!menuItemsPatches) return props;

  props = {
    ...props,
    // Shallow clone the children array and objects
    children: lodash.cloneDeep(props.children),
  };

  const { MenuGroup } = components;
  const repluggedGroup = <MenuGroup />;
  repluggedGroup.props.children = [];

  if (!Array.isArray(props.children)) props.children = [props.children];

  menuItemsPatches.forEach(({ getItem, sectionId, indexInSection }) => {
    try {
      const item = makeItem(getItem(props.data[0], props));
      if (!item) return;

      if (sectionId !== undefined && Array.isArray(props.children)) {
        const section = props.children.at(sectionId);

        if (!section) {
          logger.error("Couldn't find section", sectionId, props.children);
          return;
        }

        if (!Array.isArray(section.props.children))
          section.props.children = [section.props.children];

        section.props.children.splice(indexInSection, 0, item);
      } else {
        repluggedGroup.props.children.push(item);
      }
    } catch (e) {
      logger.error(`Failed to add item to menu ${props.navId}`, e);
    }
  });

  const hasCopyId = props.children
    .at(-1)
    ?.props?.children?.props?.id?.startsWith("devmode-copy-id-");
  if (hasCopyId) {
    props.children.splice(-1, 0, repluggedGroup);
  } else {
    props.children.push(repluggedGroup);
  }

  return props;
}
