import { ErrorBoundary } from "@components";
import { filters, getFunctionBySource, sourceStrings, waitForModule } from "@webpack";
import type {
  ContainerNodeConfig,
  NodeConfig,
  PanelNode,
  SettingBuilders,
  SidebarItemNode,
} from "src/types";
// eslint-disable-next-line no-duplicate-imports
import { NodeType } from "src/types";

const rawMod = await waitForModule(filters.bySource('"$Root"'), { raw: true });
const source = sourceStrings[rawMod.id].matchAll(/\w+\((?:\w+|"\$Root"),\w+\.\w+\.(\w+),\w+\)/g);

const settingBuilders = Object.fromEntries(
  Array.from(source).map((match) => {
    const type = match[1];
    const formattedType = type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
    const functionName = `create${formattedType}`;
    return [functionName, getFunctionBySource(rawMod.exports, `.${type},`)];
  }),
) as SettingBuilders;

export const { createPanel, createSection, createSidebarItem } = settingBuilders;

interface RepluggedCustomNode {
  node: NodeConfig;
  parent: string;
  after?: string;
}

const rpCustomNodes: RepluggedCustomNode[] = [];

/**
 * Adds a custom setting node.
 * @param node The setting node to add.
 * @param options Options for where to insert the node.
 */
export function addSettingNode(
  node: NodeConfig,
  options?: { after?: string; parent?: string },
): void {
  rpCustomNodes.push({
    node,
    parent: options?.parent ?? "$Root",
    after: options?.after,
  });
}

/**
 * Removes a custom setting node by its key.
 * @param key The key of the setting node to remove.
 */
export function removeSettingNode(key: string): void {
  const index = rpCustomNodes.findIndex((item) => item.node.key === key);
  if (index !== -1) rpCustomNodes.splice(index, 1);
}

type CustomSettingsPaneOptions = Required<Pick<SidebarItemNode, "icon" | "useTitle">> &
  Pick<SidebarItemNode, "usePredicate" | "getLegacySearchKey"> & {
    usePanelTitle?: PanelNode["useTitle"];
    render: React.ElementType;
  };

/**
 * Creates a custom settings panel with a sidebar item.
 * @param key The unique key for the custom settings panel.
 * @param options The options for the custom settings panel including icon, title, render function, and predicate.
 * @returns The custom settings node.
 */
export function createCustomSettingsPanel(
  key: string,
  {
    icon,
    useTitle,
    render: Panel,
    usePredicate,
    getLegacySearchKey,
    usePanelTitle,
  }: CustomSettingsPaneOptions,
): ReturnType<typeof createSidebarItem> {
  return createSidebarItem(`replugged_${key}_sidebar_item`, {
    icon,
    useTitle,
    getLegacySearchKey: getLegacySearchKey ?? useTitle,
    ...(usePredicate && { usePredicate }),
    buildLayout: () => [
      createPanel(`replugged_${key}_panel`, {
        useTitle: usePanelTitle ?? useTitle,
        StronglyDiscouragedCustomComponent: () => (
          <ErrorBoundary>
            <Panel />
          </ErrorBoundary>
        ),
        buildLayout: () => [],
      }),
    ],
  });
}

export function _insertNodes(containerNode: ContainerNodeConfig): NodeConfig[] {
  const layout = [...containerNode.buildLayout()];
  const expectedChildType: NodeType = containerNode.type + 1;

  if (expectedChildType !== NodeType.SECTION && expectedChildType !== NodeType.SIDEBAR_ITEM) {
    return layout;
  }

  const relevant = rpCustomNodes.filter(
    (r) => r.parent === containerNode.key && r.node.type === expectedChildType,
  );

  if (relevant.length === 0) return layout;

  const afterAnchored = relevant.filter((r) => r.after);
  const appendOnly = relevant.filter((r) => !r.after);

  const grouped = new Map<string, RepluggedCustomNode[]>();
  for (const rule of afterAnchored) {
    const key = rule.after!;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(rule);
  }

  for (const [afterKey, rules] of grouped) {
    const idx = layout.findIndex((node) => node.key === afterKey);
    if (idx === -1) continue;
    layout.splice(idx + 1, 0, ...rules.map((r) => r.node));
  }

  if (appendOnly.length > 0) {
    layout.push(...appendOnly.map((r) => r.node));
  }

  return layout;
}
