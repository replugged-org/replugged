import { React, lodash } from "@common";
import { ContextMenu } from "@components";
import type { MenuProps } from "@components/ContextMenu";
import type {
  ContextMenuTypes,
  GetContextItem,
  RawContextItem,
} from "../../../types/coremods/contextMenu";
import { Logger } from "../../modules/logger";

const logger = Logger.api("ContextMenu");

interface MenuItem {
  getItem: GetContextItem;
  sectionId: number | ((props: ContextMenuProps) => number) | undefined;
  indexInSection: number | ((props: ContextMenuProps) => number);
}

export type ContextMenuProps = MenuProps & {
  data: Array<Record<string, unknown>>;
};

export const menuItems: Record<string, MenuItem[] | undefined> = {};

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
 * @param sectionId The number of the section to add to. Defaults to ReCelled's section
 * @param indexInSection The index in the section to add to. Defaults to the end position
 * @returns A callback to de-register the function
 */
export function addContextMenuItem(
  navId: ContextMenuTypes,
  getItem: GetContextItem,
  sectionId: number | ((props: ContextMenuProps) => number) | undefined,
  indexInSection: number | ((props: ContextMenuProps) => number),
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

  const { MenuGroup } = ContextMenu;
  const recelledGroup = <MenuGroup />;
  recelledGroup.props.children = [];

  if (!Array.isArray(props.children)) props.children = [props.children];

  menuItemsPatches.forEach(({ getItem, sectionId, indexInSection }) => {
    try {
      const item = makeItem(getItem(props.data[0], props));
      if (!item) return;

      if (sectionId !== undefined && Array.isArray(props.children)) {
        sectionId = typeof sectionId === "function" ? sectionId(props) : sectionId;
        const section = props.children.at(sectionId);

        if (!section) {
          logger.error("Couldn't find section", sectionId, props.children);
          return;
        }

        if (!Array.isArray(section.props.children))
          section.props.children = [section.props.children];

        indexInSection =
          typeof indexInSection === "function" ? indexInSection(props) : indexInSection;
        section.props.children.splice(indexInSection, 0, item);
      } else {
        recelledGroup.props.children.push(item);
      }
    } catch (e) {
      logger.error(`Failed to add item to menu ${props.navId}`, e);
    }
  });

  const hasCopyId = props.children
    .at(-1)
    ?.props?.children?.props?.id?.startsWith("devmode-copy-id-");
  if (hasCopyId) {
    props.children.splice(-1, 0, recelledGroup);
  } else {
    props.children.push(recelledGroup);
  }

  return props;
}
