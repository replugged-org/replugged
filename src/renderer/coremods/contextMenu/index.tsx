import { Injector } from "src/renderer/modules/injector";
import { Logger } from "src/renderer/modules/logger";
import { filters, waitForModule } from "src/renderer/modules/webpack";
import { React } from "@common";
import type { ContextMenuProps } from "@components/ContextMenu";
import type {
  ContextItem,
  ContextMenuTypes,
  GetContextItem,
  RawContextItem,
} from "../../../types/coremods/contextMenu";
import { AnyFunction } from "src/types";

let injector: Injector;
const logger = Logger.api("ContextMenu");

export const menuItems = {} as Record<
  ContextMenuTypes,
  Array<{ getItem: GetContextItem; sectionId: number; indexInSection: number }>
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
  sectionId: number,
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
  children: React.ReactElement[];
  data: Array<Record<string, unknown>>;
  navId: ContextMenuTypes;
  plugged?: boolean;
};

/**
 * @internal
 * @hidden
 */

async function injectMenu(): Promise<void> {
  const RepluggedComponents = await waitForModule(filters.byProps("Menu", "MenuGroup", "MenuItem"));
  injector.instead(
    RepluggedComponents as Record<string, AnyFunction>,
    "Menu",
    ([menu]: [ContextMenuData], res) => {
      const ContextMenu = res as React.FunctionComponent<ContextMenuData>;
      const { navId } = menu;
      const { MenuGroup } = RepluggedComponents as Record<string, React.ComponentType>;

      // No items to insert
      // Or MenuGroup Component is not available
      if (!menuItems[navId] || !MenuGroup) {
        return <ContextMenu {...menu} />;
      }

      // The data as passed as Arguments from the calling function, so we just grab what we want from it
      const data = menu.data[0];

      const repluggedGroup = <MenuGroup />;
      repluggedGroup.props.id = "replugged";
      repluggedGroup.props.children = [];

      // Add in the new menu items right above the DevMode Copy ID
      // If the user doesn't have DevMode enabled, the new items will be at the bottom
      menu.children.splice(-1, 0, repluggedGroup);
      menuItems[navId].forEach((item) => {
        try {
          const itemRet = makeItem(item.getItem(data, menu)) as ContextItem & {
            props: { id?: string };
          };

          if (itemRet?.props) {
            // add in unique ids
            itemRet.props.id = `${itemRet.props.id || "repluggedItem"}-${Math.random()
              .toString(36)
              .substring(2)}`;
          }

          if (!menu.children.at(item.sectionId)?.props?.plugged) {
            // menu props can stay same while having different children
            // so we check children props if its plugged or not
            menu.children
              .at(item.sectionId)
              ?.props.children?.splice(item.indexInSection, 0, itemRet);
            if (menu.children.at(item.sectionId)?.props)
              menu.children.at(item.sectionId)!.props.plugged = true;
          }
        } catch (err) {
          logger.error("Error while running GetContextItem function", err, item.getItem);
        }
      });

      return <ContextMenu {...menu} />;
    },
  );
}
export function start(): void {
  injector = new Injector();
  void injectMenu();
}

export function stop(): void {
  injector.uninjectAll();
}
