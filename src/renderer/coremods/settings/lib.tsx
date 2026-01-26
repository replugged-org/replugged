import { ErrorBoundary } from "@components";
import { filters, getFunctionBySource, waitForModule } from "@webpack";
import type {
  BuilderFunction,
  PanelNode,
  ProcessedNode,
  SectionNode,
  SidebarItemNode,
} from "src/types";
// eslint-disable-next-line no-duplicate-imports
import { NodeType } from "src/types";

const mod = await waitForModule(filters.bySource('"$Root"'));

export const createSection = getFunctionBySource<BuilderFunction<SectionNode>>(mod, "SECTION,")!;
export const createSidebarItem = getFunctionBySource<BuilderFunction<SidebarItemNode>>(
  mod,
  "SIDEBAR_ITEM,",
)!;
export const createPanel = getFunctionBySource<BuilderFunction<PanelNode>>(mod, "PANEL,")!;

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

type CustomSettingsPaneOptions = Required<Pick<SidebarItemNode, "icon" | "useTitle">> &
  Pick<SidebarItemNode, "usePredicate" | "getLegacySearchKey" | "useSearchTerms"> & {
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
    useSearchTerms,
  }: CustomSettingsPaneOptions,
): ReturnType<typeof createSidebarItem> {
  return createSidebarItem(`replugged_${key}_sidebar_item`, {
    icon,
    useTitle,
    getLegacySearchKey: getLegacySearchKey ?? useTitle,
    ...(usePredicate && { usePredicate }),
    buildLayout: () => [
      createPanel(`replugged_${key}_panel`, {
        useSearchTerms,
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

export function _insertNodes(root: ProcessedNode): ProcessedNode[] {
  const layout = [...root.buildLayout()];
  const expectedChildType: NodeType = root.type + 1;

  if (expectedChildType !== NodeType.SECTION && expectedChildType !== NodeType.SIDEBAR_ITEM) {
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
