import { ErrorBoundary } from "@components";
import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type {
  FactoryFunction,
  PaneNode,
  PanelNode,
  ProcessedNode,
  SectionNode,
  SidebarItemNode,
} from "src/types";
// eslint-disable-next-line no-duplicate-imports
import { NodeType } from "src/types";

const mod = await waitForModule(filters.bySource('"$Root"'));

export const createSection = getFunctionBySource<FactoryFunction<SectionNode>>(mod, "SECTION,")!;
export const createSidebarItem = getFunctionBySource<FactoryFunction<SidebarItemNode>>(
  mod,
  "SIDEBAR_ITEM,",
)!;
export const createPanel = getFunctionBySource<FactoryFunction<PanelNode>>(mod, "PANEL,")!;
export const createPane = getFunctionBySource<FactoryFunction<PaneNode>>(mod, "PANE,")!;

interface CustomNode {
  node: ProcessedNode;
  parent: string;
  after?: string;
}

const customNodes: CustomNode[] = [];

/**
 * Adds a custom setting node.
 * @param node The setting node to add.
 * @param options Options for where to insert the node.
 */
export function addSettingNode(
  node: ProcessedNode,
  options?: { after?: string; parent?: string },
): void {
  customNodes.push({
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
  const index = customNodes.findIndex((item) => item.node.key === key);
  if (index !== -1) customNodes.splice(index, 1);
}

type CustomSettingsPaneOptions = Required<
  Pick<SidebarItemNode, "icon" | "useTitle"> & Pick<PaneNode, "render">
> &
  Pick<SidebarItemNode, "usePredicate">;

/**
 * Creates a custom settings pane with a sidebar item and panel.
 * @param key The unique key for the custom settings pane.
 * @param options The options for the custom settings pane including icon, title, render function, and predicate.
 * @returns A sidebar item node representing the custom settings pane.
 */
export function createCustomSettingsPane(
  key: string,
  { icon, useTitle, render: Pane, usePredicate }: CustomSettingsPaneOptions,
): ReturnType<typeof createSidebarItem> {
  return createSidebarItem(`replugged_${key}_sidebar_item`, {
    icon,
    useTitle,
    getLegacySearchKey: useTitle,
    ...(usePredicate && { usePredicate }),
    buildLayout: () => [
      createPanel(`replugged_${key}_panel`, {
        useTitle,
        buildLayout: () => [
          createPane(`replugged_${key}_pane`, {
            render: () => (
              <ErrorBoundary>
                <Pane />
              </ErrorBoundary>
            ),
            buildLayout: () => [],
          }),
        ],
      }),
    ],
  });
}

export function _insertNodes(root: ProcessedNode): ProcessedNode[] {
  const layout = [...root.buildLayout()];
  const expectedChildType: NodeType = root.type + 1;

  if (expectedChildType !== NodeType.SECTION && expectedChildType !== NodeType.SIDEBAR) {
    return layout;
  }

  const relevant = customNodes.filter(
    (r) => r.parent === root.key && r.node.type === expectedChildType,
  );

  if (relevant.length === 0) return layout;

  const afterAnchored = relevant.filter((r) => r.after);
  const appendOnly = relevant.filter((r) => !r.after);

  const grouped = new Map<string, CustomNode[]>();
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
