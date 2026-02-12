import type { Store } from "@common/flux";
import type React from "react";
import type { PascalCase } from "type-fest";

import type {
  ButtonProps,
  InlineNoticeType,
  SliderProps,
  SwitchProps,
} from "discord-client-types/discord_app/design/web";
import type { BaseRadioGroupProps } from "discord-client-types/discord_common/packages/design/components/RadioGroup/BaseRadioGroup";

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

export enum SidebarItemTrailingType {
  BADGE_NEW,
  BADGE_COUNT,
  STRONGLY_DISCOURAGED_CUSTOM,
}

enum NoticeType {
  INLINE_NOTICE,
  STRONGLY_DISCOURAGED_CUSTOM,
}

enum CategoryHeaderDecorationButtonGroupType {
  BUTTON,
  STRONGLY_DISCOURAGED_CUSTOM,
}

export enum CategoryHeaderDecorationType {
  BUTTON_GROUP,
}

export interface CommonNodeProps {
  initialize?: () => void;
  useTitle?: (state?: boolean) => string;
  usePredicate?: () => boolean;
  useSearchTerms?: () => string[];
  getLegacySearchKey?: () => string;
}

export type RootNode = CommonNodeProps;

export interface SectionNode extends CommonNodeProps {
  hoisted?: boolean;
}

interface TrailingBadgeNew {
  type: SidebarItemTrailingType.BADGE_NEW;
  getDismissibleContentTypes?: () => number[];
  stronglyDiscouragedBadgeComponent?: React.ElementType;
}

interface TrailingBadgeCount {
  type: SidebarItemTrailingType.BADGE_COUNT;
  useCount: () => number;
}

interface TrailingStronglyDiscouragedCustom {
  type: SidebarItemTrailingType.STRONGLY_DISCOURAGED_CUSTOM;
  getDismissibleContentTypes?: () => number[];
  useCustomDecoration?: (visibleContent: number | null, isSelected: boolean) => React.ReactNode;
}

export interface SidebarItemNode extends CommonNodeProps {
  icon?: React.ElementType;
  StronglyDiscouragedCustomComponent?: React.ElementType;
  trailing?: TrailingBadgeNew | TrailingBadgeCount | TrailingStronglyDiscouragedCustom;
  variant?: "default" | "destructive";
}

export interface PanelNode extends CommonNodeProps {
  useTitle: (state?: boolean) => string;
  StronglyDiscouragedCustomComponent?: React.ElementType;
  useBadge?: () => React.ReactNode;
  notice?: { stores?: Store[]; element: React.ElementType };
  hideInStreamerMode?: boolean;
}

export type SplitNode = CommonNodeProps;

interface NoticeInlineNotice {
  type: NoticeType.INLINE_NOTICE;
  noticeType: InlineNoticeType;
  useText: () => string;
}

interface NoticeStronglyDiscouragedCustom {
  type: NoticeType.STRONGLY_DISCOURAGED_CUSTOM;
  notice: React.ElementType;
}

interface CategoryHeaderDecorationButton {
  type: CategoryHeaderDecorationButtonGroupType.BUTTON;
  id: string;
  useText: () => string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

interface CategoryHeaderDecorationStronglyDiscouragedCustom {
  type: CategoryHeaderDecorationButtonGroupType.STRONGLY_DISCOURAGED_CUSTOM;
  id: string;
  button: React.ElementType;
}

interface CategoryHeaderDecorationButtonGroup {
  type: CategoryHeaderDecorationType.BUTTON_GROUP;
  buttons: CategoryHeaderDecorationButton[] | CategoryHeaderDecorationStronglyDiscouragedCustom[];
}

export interface CategoryNode extends CommonNodeProps {
  icon?: React.ElementType;
  useSubnavLabel?: () => string;
  useSubtitle?: () => string;
  useInlineNotice?: () => NoticeInlineNotice | NoticeStronglyDiscouragedCustom;
  useHeaderDecoration?: () => CategoryHeaderDecorationButtonGroup;
}

export interface AccordionNode extends Omit<CommonNodeProps, "useTitle"> {
  useTitle?: (state: boolean) => string;
  useCollapsedSubtitle?: () => string;
}

export interface ListNode extends CommonNodeProps {
  collapseAfter?: number;
  useCollapsibleTitle?: (state: boolean) => string;
  useCollapsedSubtitle?: () => string;
}

export type RelatedNode = CommonNodeProps;

export interface FieldSetNode extends CommonNodeProps {
  useSubtitle?: () => string;
}

export type TabItemNode = CommonNodeProps;

export interface NestedPanelNode extends CommonNodeProps {
  useSubtitle?: () => string;
}

export interface StaticNode extends CommonNodeProps {
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => string;
}

export interface ButtonNode extends CommonNodeProps {
  useLabel: () => string;
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => string;
  useVariant?: () => ButtonProps["variant"];
  useDisabled?: () => boolean;
  onClick: () => void | Promise<void>;
}

export interface ToggleNode extends CommonNodeProps {
  useValue: () => boolean;
  setValue: (value: boolean) => void;
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => string;
  useDisabled?: () => boolean;
  useDisabledMessage?: () => string;
  useBadge?: () => SwitchProps["badge"];
  hasIcon?: boolean;
}

export interface SliderNode
  extends CommonNodeProps,
    Pick<
      SliderProps,
      | "minValue"
      | "maxValue"
      | "onValueRender"
      | "asValueChanges"
      | "markers"
      | "onMarkerRender"
      | "stickToMarkers"
    > {
  setValue: SliderProps["onValueChange"];
  getInitialValue: () => number;
  useDefaultValue?: () => number;
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => string;
  useHintText?: () => string;
  useDisabled?: () => boolean;
  fieldLayout?: SliderProps["layout"];
}

export interface SelectNode extends CommonNodeProps {
  useValue: () => string | number;
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => string;
  useOptions: () => Array<{ label: string; value: string | number; id: string }>;
  clearable?: boolean;
  setValue: (value: string | number) => void;
}

export interface RadioNode extends CommonNodeProps {
  useValue: () => string;
  setValue: (value: string) => void;
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => string;
  useOptions: () => BaseRadioGroupProps["options"];
  useBadge?: () => BaseRadioGroupProps["badge"];
}

export interface NavigatorNode extends CommonNodeProps {
  destinationKey: string;
  useSubtitle?: () => string;
  useBadge?: () => React.ReactNode;
}

export interface CustomNode extends CommonNodeProps {
  Component: React.ElementType;
}

interface NodeDefinitions {
  ROOT: RootNode;
  SECTION: SectionNode;
  SIDEBAR_ITEM: SidebarItemNode;
  PANEL: PanelNode;
  SPLIT: SplitNode;
  CATEGORY: CategoryNode;
  ACCORDION: AccordionNode;
  LIST: ListNode;
  RELATED: RelatedNode;
  FIELD_SET: FieldSetNode;
  TAB_ITEM: TabItemNode;
  NESTED_PANEL: NestedPanelNode;
  STATIC: StaticNode;
  BUTTON: ButtonNode;
  TOGGLE: ToggleNode;
  SLIDER: SliderNode;
  SELECT: SelectNode;
  RADIO: RadioNode;
  NAVIGATOR: NavigatorNode;
  CUSTOM: CustomNode;
}

type ContainerKeys =
  | "ROOT"
  | "SECTION"
  | "SIDEBAR_ITEM"
  | "PANEL"
  | "SPLIT"
  | "CATEGORY"
  | "ACCORDION"
  | "LIST"
  | "RELATED"
  | "FIELD_SET"
  | "TAB_ITEM"
  | "NESTED_PANEL";

type LeafKeys = Exclude<keyof NodeDefinitions, ContainerKeys>;

type NodeLayout = NodeConfig[];

type BaseNode<K extends keyof NodeDefinitions> = NodeDefinitions[K] & {
  key: string;
  type: (typeof NodeType)[K];
};

type ContainerNode<K extends keyof NodeDefinitions> = BaseNode<K> & {
  buildLayout: () => NodeLayout;
};

type LeafNode<K extends keyof NodeDefinitions> = BaseNode<K>;

export type ContainerNodeConfig = {
  [K in ContainerKeys]: ContainerNode<K>;
}[ContainerKeys];

export type LeafNodeConfig = {
  [K in LeafKeys]: LeafNode<K>;
}[LeafKeys];

export type NodeConfig = ContainerNodeConfig | LeafNodeConfig;

type ContainerBuilder<K extends keyof NodeDefinitions> = (
  key: string,
  config: NodeDefinitions[K] & { buildLayout: () => NodeLayout },
) => ContainerNode<K>;

type LeafBuilder<K extends keyof NodeDefinitions> = (
  key: string,
  config: NodeDefinitions[K],
) => LeafNode<K>;

export type SettingBuilders = {
  [K in keyof NodeDefinitions as `create${PascalCase<K>}`]: K extends ContainerKeys
    ? ContainerBuilder<K>
    : LeafBuilder<K>;
};

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
