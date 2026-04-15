import type { Store } from "@common/flux";
import type React from "react";
import type { PascalCase } from "type-fest";

import type {
  ButtonProps,
  InlineNoticeType,
  MenuSubmenuItemProps,
  MenuSubmenuListItemProps,
  RadioGroupProps,
  SliderProps,
} from "discord-client-types/discord_app/design/web";

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

export enum NavigatorTrailingDecorationType {
  STACKED_ICONS,
}

export enum NavigatorTrailingDecorationStackedIconsType {
  ROUNDED,
  SQUIRCLE,
}

export enum NestedPanelLeadingDecorationType {
  ICON,
}

export enum NestedPanelTrailingDecorationType {
  TEXT,
}

export enum PanelDecorationType {
  STRONGLY_DISCOURAGED_CUSTOM,
}

export enum CategoryInlineNoticeType {
  INLINE_NOTICE,
  STRONGLY_DISCOURAGED_CUSTOM,
}

export enum CategoryHeaderDecorationButtonGroupType {
  BUTTON,
  STRONGLY_DISCOURAGED_CUSTOM,
}

export enum CategoryHeaderDecorationType {
  BUTTON_GROUP,
}

export enum SidebarItemBadgeType {
  NEW,
  BETA,
  COUNT,
  STRONGLY_DISCOURAGED_CUSTOM,
}

export enum ButtonTrailingContentType {
  TEXT,
  STRONGLY_DISCOURAGED_CUSTOM,
}

export interface CommonNodeProps {
  initialize?: () => void;
  useTitle?: (state?: boolean) => string;
  usePredicate?: () => boolean;
  useSearchTerms?: () => string[];
}

export type RootNode = CommonNodeProps;

export interface SectionNode extends CommonNodeProps {
  hoisted?: boolean;
}

interface TrailingBeta {
  badgeType: SidebarItemBadgeType.BETA;
}

interface TrailingCount {
  badgeType: SidebarItemBadgeType.COUNT;
  useCount: () => number;
}

interface TrailingStronglyDiscouragedCustom {
  badgeType: SidebarItemBadgeType.STRONGLY_DISCOURAGED_CUSTOM;
  useCustomBadge?: () => React.ReactNode;
}

interface DismissibleBadgeNew {
  badgeType: SidebarItemBadgeType.NEW;
  dismissibleContent?: number;
}

interface DismissibleBadgeStronglyDiscouragedCustom {
  badgeType: SidebarItemBadgeType.STRONGLY_DISCOURAGED_CUSTOM;
  dismissibleContent?: number;
  StronglyDiscouragedCustomComponent: React.ElementType;
}

export interface SidebarItemNode extends CommonNodeProps {
  icon?: React.ElementType;
  StronglyDiscouragedCustomComponent?: React.ElementType;
  usePersistentBadge?: (
    active: boolean,
  ) => TrailingBeta | TrailingCount | TrailingStronglyDiscouragedCustom;
  variant?: "default" | "destructive";
  getDismissibleBadges?: () => Array<
    DismissibleBadgeNew | DismissibleBadgeStronglyDiscouragedCustom
  >;
  useMenu?: () =>
    | React.PropsWithChildren<MenuSubmenuItemProps>
    | React.PropsWithChildren<MenuSubmenuListItemProps>;
}

interface PanelDecorationStronglyDiscouragedCustom {
  type: PanelDecorationType.STRONGLY_DISCOURAGED_CUSTOM;
  component: React.ElementType;
  sticky?: boolean;
}

export interface PanelNode extends CommonNodeProps {
  useTitle: (state?: boolean) => string;
  decoration?: PanelDecorationStronglyDiscouragedCustom;
  useObscuredNotice?: () => React.ElementType;
  notice?: { stores?: Store[]; element: React.ElementType };
  usePersistentBadge?: () => TrailingBeta | TrailingCount | TrailingStronglyDiscouragedCustom;
}

export type SplitNode = CommonNodeProps;

interface NoticeInlineNotice {
  type: CategoryInlineNoticeType.INLINE_NOTICE;
  noticeType: InlineNoticeType;
  useTitle?: () => React.ReactNode;
  useText: () => React.ReactNode;
  button?: {
    useText: () => React.ReactNode;
    onClick: () => void | Promise<void>;
  };
}

interface NoticeStronglyDiscouragedCustom {
  type: CategoryInlineNoticeType.STRONGLY_DISCOURAGED_CUSTOM;
  notice: React.ElementType;
}

interface CategoryHeaderDecorationButton extends Omit<ButtonProps, "type" | "variant"> {
  type: CategoryHeaderDecorationButtonGroupType.BUTTON;
  id: string;
}

interface CategoryHeaderDecorationStronglyDiscouragedCustom {
  type: CategoryHeaderDecorationButtonGroupType.STRONGLY_DISCOURAGED_CUSTOM;
  id: string;
  button: React.ElementType;
}

interface CategoryHeaderDecorationButtonGroup {
  type: CategoryHeaderDecorationType.BUTTON_GROUP;
  buttons: Array<
    CategoryHeaderDecorationButton | CategoryHeaderDecorationStronglyDiscouragedCustom
  >;
}

export interface CategoryNode extends CommonNodeProps {
  icon?: React.ElementType;
  useSubnavLabel?: () => React.ReactNode;
  useSubtitle?: () => React.ReactNode;
  useInlineNotice?: () => NoticeInlineNotice | NoticeStronglyDiscouragedCustom | undefined;
  useHeaderDecoration?: () => CategoryHeaderDecorationButtonGroup;
}

export interface AccordionNode extends CommonNodeProps {
  useCollapsedSubtitle?: () => React.ReactNode;
}

export interface ListNode extends CommonNodeProps {
  collapseAfter?: number;
  useCollapsibleTitle?: (state: boolean, numVisible: number) => React.ReactNode;
  useCollapsedSubtitle?: () => React.ReactNode;
}

export type RelatedNode = CommonNodeProps;

export interface FieldSetNode extends CommonNodeProps {
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => React.ReactNode;
  variant?: "default" | "compact";
  isTitleHiddenVisually?: boolean;
}

export interface TabItemNode extends CommonNodeProps {
  getTitle: () => React.ReactNode;
  onItemSelect?: () => void;
}

interface NestedPanelLeadingDecorationIcon {
  type: NestedPanelLeadingDecorationType.ICON;
  icon: React.ElementType;
  color?: string;
  backgroundColor?: string;
}

interface NestedPanelTrailingDecorationText {
  type: NestedPanelTrailingDecorationType.TEXT;
  useText: () => React.ReactNode;
}

export interface NestedPanelNode extends CommonNodeProps {
  useSubtitle?: () => React.ReactNode;
  useLeadingDecoration?: () => NestedPanelLeadingDecorationIcon;
  useTrailingDecoration?: () => NestedPanelTrailingDecorationText;
}

export interface StaticNode extends CommonNodeProps {
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => React.ReactNode;
}

interface ButtonTrailingContentText {
  type: ButtonTrailingContentType.TEXT;
  useText: () => React.ReactNode;
}

interface ButtonTrailingContentStronglyDiscouragedCustom {
  type: ButtonTrailingContentType.STRONGLY_DISCOURAGED_CUSTOM;
  StronglyDiscouragedCustomComponent: React.ElementType;
}

export interface ButtonNode extends CommonNodeProps {
  useLabel: () => React.ReactNode;
  useTitle: (state?: boolean) => string;
  useAriaLabel?: () => string;
  useSubtitle?: () => React.ReactNode;
  useVariant?: () => ButtonProps["variant"];
  useDisabled?: () => boolean;
  useTrailingContent?: () =>
    | ButtonTrailingContentText
    | ButtonTrailingContentStronglyDiscouragedCustom;
  onClick: () => void | Promise<void>;
}

export interface ToggleNode extends CommonNodeProps {
  useValue: () => boolean;
  setValue: (value: boolean) => void;
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => React.ReactNode;
  useDisabled?: () => boolean;
  useDisabledMessage?: () => React.ReactNode;
  usePersistentBadge?: () => TrailingBeta;
  hasIcon?: boolean;
  getDismissibleBadges?: () => DismissibleBadgeNew[];
}

export interface SliderNode
  extends
    CommonNodeProps,
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
  setValue?: SliderProps["onValueChange"];
  getInitialValue: () => number;
  useDefaultValue?: () => number;
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => React.ReactNode;
  useHintText?: () => React.ReactNode;
  useDisabled?: () => boolean;
  useExternalValue?: () => number;
  fieldLayout?: SliderProps["layout"];
  usePersistentBadge?: () => TrailingBeta;
  getDismissibleBadges?: () => DismissibleBadgeNew[];
}

export interface SelectNode extends CommonNodeProps {
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => React.ReactNode;
  useValue: () => string | number;
  setValue: (value: string | number) => void;
  useOptions: () => Array<{ label: string; value: string | number; id: string }>;
  clearable?: boolean;
  closeOnSelect?: boolean;
  wrapTags?: boolean;
  selectionMode?: "single" | "multiple";
  usePersistentBadge?: () => TrailingBeta;
  getDismissibleBadges?: () => DismissibleBadgeNew[];
}

export interface RadioNode extends CommonNodeProps {
  useValue: () => RadioGroupProps["value"];
  setValue: RadioGroupProps["onChange"];
  useTitle: (state?: boolean) => string;
  useSubtitle?: () => React.ReactNode;
  useOptions: () => RadioGroupProps["options"];
  usePersistentBadge?: () => TrailingBeta;
  getDismissibleBadges?: () => DismissibleBadgeNew[];
}

interface NavigatorTrailingDecorationStackedIconsIcon {
  shape: NavigatorTrailingDecorationStackedIconsType;
  icon: React.ElementType;
}

interface NavigatorTrailingDecorationStackedIcons {
  type: NavigatorTrailingDecorationType.STACKED_ICONS;
  useIcons: () =>
    | Array<{
        frontIcon: NavigatorTrailingDecorationStackedIconsIcon;
        backIcon?: NavigatorTrailingDecorationStackedIconsIcon;
      }>
    | undefined;
}

export interface NavigatorNode extends CommonNodeProps {
  destinationKey: string;
  useTrailingDecoration?: () => NavigatorTrailingDecorationStackedIcons;
  useSubtitle?: () => React.ReactNode;
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
