import type { Store } from "@common/flux";
import type React from "react";

export enum NodeType {
  ROOT,
  SECTION,
  SIDEBAR,
  PANEL,
  PANE,
  SPLIT,
  CATEGORY,
  ACCORDION,
  LIST,
  FIELD_SET,
  STATIC,
  BUTTON,
  TOGGLE,
  SLIDER,
  SELECT,
  RADIO,
  CHECKBOX,
  NAVIGATOR,
  CUSTOM,
}

enum TrailingType {
  POPOVER,
  BADGE_NEW,
  BADGE_COUNT,
  STRONGLY_DISCOURAGED_CUSTOM,
}

export interface CommonNodeProps {
  useTitle?: (state?: boolean) => string;
  useNavigationTitle?: () => string;
  usePredicate?: () => boolean;
  useSearchTerms?: () => string[];
  getLegacySearchKey?: () => string;
}

export interface SectionNode extends CommonNodeProps {
  useLabel?: () => string;
  hoisted?: boolean;
}

interface TrailingBadgeNew {
  type: TrailingType.BADGE_NEW;
  getDismissibleContentTypes?: () => number[];
  badgeComponent?: React.ElementType;
}

interface TrailingBadgeCount {
  type: TrailingType.BADGE_COUNT;
  useCount: () => number;
}

interface TrailingStronglyDiscouragedCustom {
  type: TrailingType.STRONGLY_DISCOURAGED_CUSTOM;
  getDismissibleContentTypes?: () => number[];
  useDecoration?: (visibleContent: number | null, isSelected: boolean) => React.ReactNode;
}

type SidebarItemTrailingType =
  | TrailingBadgeNew
  | TrailingBadgeCount
  | TrailingStronglyDiscouragedCustom;

export interface SidebarItemNode extends CommonNodeProps {
  icon?: React.ElementType;
  stronglyDiscouragedCustomComponent?: React.ElementType;
  trailing?: SidebarItemTrailingType;
}

export interface PanelNode extends CommonNodeProps {
  useTitle: (state?: boolean) => string;
  useBadge?: () => React.ReactNode;
  notice?: { stores?: Store[]; element: React.ElementType };
}

export interface PaneNode extends CommonNodeProps {
  render?: React.ElementType;
}

export interface ProcessedNode {
  key: string;
  type: NodeType;
  buildLayout: () => ProcessedNode[];
  [key: string]: unknown;
}

export type FactoryFunction<T = Record<string, unknown>> = (
  key: string,
  config: T & { buildLayout: () => ProcessedNode[] },
) => T & ProcessedNode;

interface UserSettingsFormProps {
  title?: React.ReactNode;
  className?: string;
}

export type UserSettingsFormType = React.FC<React.PropsWithChildren<UserSettingsFormProps>>;

export const VIBRANCY_SELECT_OPTIONS = [
  { label: "Titlebar", value: "titlebar" },
  { label: "Selection", value: "selection" },
  { label: "Menu", value: "menu" },
  { label: "Popover", value: "popover" },
  { label: "Sidebar", value: "sidebar" },
  { label: "Header", value: "header" },
  { label: "Sheet", value: "sheet" },
  { label: "Window", value: "window" },
  { label: "HUD", value: "hud" },
  { label: "Fullscreen UI", value: "fullscreen-ui" },
  { label: "Tooltip", value: "tooltip" },
  { label: "Content", value: "content" },
  { label: "Under Window", value: "under-window" },
  { label: "Under Page", value: "under-page" },
] as const;
export type VibrancyType = (typeof VIBRANCY_SELECT_OPTIONS)[number]["value"];

export const BACKGROUND_MATERIALS = ["auto", "none", "mica", "acrylic", "tabbed"] as const;
export type BackgroundMaterialType = (typeof BACKGROUND_MATERIALS)[number];
