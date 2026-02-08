import type { Store } from "@common/flux";
import type React from "react";

export enum NodeType {
  ROOT,
  SECTION,
  SIDEBAR_ITEM,
  PANEL,
  SPLIT,
  CATEGORY,
  ACCORDION,
  LIST,
  RELATED,
  FIELD_SET,
  TAB_ITEM,
  NESTED_PANEL,
  STATIC,
  BUTTON,
  TOGGLE,
  SLIDER,
  SELECT,
  RADIO,
  NAVIGATOR,
  CUSTOM,
}

enum TrailingType {
  BADGE_NEW,
  BADGE_COUNT,
  STRONGLY_DISCOURAGED_CUSTOM,
}

export interface CommonNodeProps {
  useTitle?: (state?: boolean) => string;
  usePredicate?: () => boolean;
  useSearchTerms?: () => string[];
  getLegacySearchKey?: () => string;
}

export interface SectionNode extends CommonNodeProps {
  hoisted?: boolean;
}

interface TrailingBadgeNew {
  type: TrailingType.BADGE_NEW;
  getDismissibleContentTypes?: () => number[];
  stronglyDiscouragedBadgeComponent?: React.ElementType;
}

interface TrailingBadgeCount {
  type: TrailingType.BADGE_COUNT;
  useCount: () => number;
}

interface TrailingStronglyDiscouragedCustom {
  type: TrailingType.STRONGLY_DISCOURAGED_CUSTOM;
  getDismissibleContentTypes?: () => number[];
  useCustomDecoration?: (visibleContent: number | null, isSelected: boolean) => React.ReactNode;
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
  StronglyDiscouragedCustomComponent?: React.ElementType;
  useBadge?: () => React.ReactNode;
  notice?: { stores?: Store[]; element: React.ElementType };
  hideInStreamerMode?: boolean;
}

export interface ProcessedNode {
  key: string;
  type: NodeType;
  buildLayout: () => ProcessedNode[];
  [key: string]: unknown;
}

export type BuilderFunction<T = Record<string, unknown>> = (
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
