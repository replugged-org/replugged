export interface RawSettingsSectionLayout {
  header: () => string;
  predicate?: () => boolean;
  layout: RawSettingsSidebarLayout[];
}

export interface SettingsLayoutSection {
  key: string;
  type: 1;
  useLabel: () => string;
  usePredicate?: () => boolean;
  buildLayout: () => SettingsLayoutSidebar[];
}

export interface RawSettingsSidebarLayout {
  parentKey?: string;
  key: string;
  icon?: React.FC;
  title: () => string;
  render: React.FC;
  predicate?: () => boolean;
}

export interface SettingsLayoutSidebar {
  key: string;
  icon: React.FC;
  useTitle: () => string;
  legacySearchKey: string;
  type: 2;
  usePredicate?: () => boolean;
  buildLayout: () => SettingsLayoutPanel[];
}

export interface SettingsLayoutPanel {
  key: string;
  useTitle: () => string;
  type: 3;
  buildLayout: () => SettingsLayoutContents[];
}

export interface SettingsLayoutContents {
  key: string;
  useTitle: () => string;
  buildLayout: () => [];
  render: React.FC;
  type: 4;
}

export function buildSection({
  header,
  layout,
  predicate,
}: RawSettingsSectionLayout): SettingsLayoutSection {
  const sectionKey = header().toLowerCase();
  return {
    key: `${sectionKey}_section`,
    type: 1,
    useLabel: header,
    usePredicate: predicate,
    buildLayout: () =>
      layout.map(({ key, icon, title, render, predicate }) => {
        return buildSidebar({ key, icon, title, render, predicate, parentKey: sectionKey });
      }),
  };
}

export function buildSidebar({
  parentKey,
  key,
  icon,
  title,
  render,
  predicate,
}: RawSettingsSidebarLayout): SettingsLayoutSidebar {
  return {
    key: `${parentKey}-sidebar-${key}`,
    icon: icon || (() => null),
    useTitle: title,
    legacySearchKey: title(),
    type: 2,
    usePredicate: predicate,
    buildLayout: () => [
      {
        key,
        useTitle: title,
        type: 3,
        buildLayout: () => [
          {
            key,
            useTitle: title,
            buildLayout: () => [],
            render,
            type: 4,
          },
        ],
      },
    ],
  };
}

export interface DataType {
  parent: string;
  after: string;
  buildLayout: () => SettingsLayoutSection | SettingsLayoutSidebar;
}

const Sections = new Map<string, DataType>();

export const AddbleLayout = { Section: "SECTION", Sidebar: "SIDEBAR" } as const;

// mmaybe we should make an enum of setting keys for parent/after like context menu navids but this is for replugged's internal use so its fine?
export function add({
  key,
  parent,
  after,
  settings,
  type,
}: {
  key: string;
  parent: string;
  after: string;
} & (
  | {
      settings: RawSettingsSectionLayout;
      type?: "SECTION" | undefined;
    }
  | {
      settings: RawSettingsSidebarLayout;
      type: "SIDEBAR";
    }
)): DataType {
  const data = {
    parent,
    after,
    buildLayout: () =>
      !type || type === AddbleLayout.Section
        ? buildSection(settings)
        : buildSidebar(settings as RawSettingsSidebarLayout),
  };
  Sections.set(key, data);
  return data;
}

export function remove(key: string): void {
  Sections.delete(key);
}

export type InternalLayouts =
  | {
      key: string;
      type: 0;
      buildLayout: () => SettingsLayoutSection[];
    }
  | {
      key: string;
      type: 1;
      buildLayout: () => SettingsLayoutSidebar[];
    }
  | {
      key: string;
      type: 2;
      buildLayout: () => SettingsLayoutPanel[];
    }
  | {
      key: string;
      type: 3;
      buildLayout: () => SettingsLayoutContents[];
    }
  | {
      key: string;
      type: 4;
      buildLayout: () => [];
    };

export function insert(layoutParent: InternalLayouts): unknown {
  const layout = layoutParent.buildLayout();
  if ([0, 1].includes(layoutParent.type))
    for (const { parent, after, buildLayout } of Sections.values()) {
      if (parent !== layoutParent.key) continue;
      const afterIndex = layout.findIndex((s) => after === s.key);
      if (afterIndex === -1) continue;
      const rpLayout = buildLayout();
      if (rpLayout.type !== layoutParent.type + 1) continue;
      layout.splice(afterIndex + 1, 0, rpLayout as SettingsLayoutSection & SettingsLayoutSidebar);
    }
  return layout;
}

export default {
  buildSection,
  buildSidebar,
  add,
  remove,
  insert,
};
