import type { ModuleExports } from "../../../types";
import { error } from "../logger";

const modulePromises: Array<() => Promise<void>> = [];

function importTimeout<T extends ModuleExports>(
  name: string,
  moduleImport: Promise<T>,
  cb: (mod: T) => Promise<void>,
): void {
  modulePromises.push(
    () =>
      new Promise<void>((res, rej) => {
        const timeout = setTimeout(() => {
          error("Components", name, void 0, `Could not find component "${name}"`);
          rej(new Error(`Module not found: "${name}`));
        }, 10_000);
        void moduleImport
          .then(async (mod) => {
            await cb(mod);
            clearTimeout(timeout);
            res();
          })
          .catch((err: unknown) => {
            error("Components", name, void 0, `Failed to import component "${name}"`, err);
            rej(err instanceof Error ? err : new Error(String(err)));
          });
      }),
  );
}

import type { FlexType } from "./Flex";
export type { FlexType };
export let Flex: FlexType;
importTimeout("Flex", import("./Flex"), async (mod) => {
  Flex = await mod.default;
});

import type { ContextMenuType } from "./ContextMenu";
export type { ContextMenuType };
export let ContextMenu: ContextMenuType;
importTimeout("ContextMenu", import("./ContextMenu"), async (mod) => {
  ContextMenu = await mod.default;
});

import type { SwitchItemType, SwitchType } from "./SwitchItem";
export type { SwitchType, SwitchItemType };
export let Switch: SwitchType;
export let SwitchItem: SwitchItemType;
importTimeout("SwitchItem", import("./SwitchItem"), async (mod) => {
  const comps = await mod.default;
  Switch = comps.Switch;
  SwitchItem = comps.SwitchItem;
});

import type { RadioItemType, RadioType } from "./RadioItem";
export type { RadioType, RadioItemType };
export let Radio: RadioType;
export let RadioItem: RadioItemType;

importTimeout("RadioItem", import("./RadioItem"), async (mod) => {
  const comps = await mod.default;
  Radio = comps.Radio;
  RadioItem = comps.RadioItem;
});

import type { SelectItemType, SelectType } from "./SelectItem";
export type { SelectType, SelectItemType };
export let Select: SelectType;
export let SelectItem: SelectItemType;
importTimeout("SelectItem", import("./SelectItem"), async (mod) => {
  const comps = await mod.default;
  Select = comps.Select;
  SelectItem = comps.SelectItem;
});

import type { ModalType } from "./Modal";
export type { ModalType };
export let Modal: ModalType;
importTimeout("Modal", import("./Modal"), async (mod) => {
  Modal = await mod.default;
});

import type { DividerType } from "./Divider";
export type { DividerType };
export let Divider: DividerType;
importTimeout("Divider", import("./Divider"), async (mod) => {
  Divider = await mod.default;
});

import type { TooltipType } from "./Tooltip";
export type { TooltipType };
export let Tooltip: TooltipType;
importTimeout("Tooltip", import("./Tooltip"), async (mod) => {
  Tooltip = await mod.default;
});

import type { FormTextType } from "./FormText";
export type { FormTextType };
export let FormText: FormTextType;
importTimeout("FormText", import("./FormText"), (mod) => {
  FormText = mod.FormText;
  return Promise.resolve();
});

import type { FormItemType } from "./FormItem";
export type { FormItemType };
export let FormItem: FormItemType;
importTimeout("FormItem", import("./FormItem"), async (mod) => {
  FormItem = await mod.default;
});

import type { FormNoticeType } from "./FormNotice";
export type { FormNoticeType };
export let FormNotice: FormNoticeType;
importTimeout("FormNotice", import("./FormNotice"), async (mod) => {
  FormNotice = await mod.default;
});

import type { BreadcrumbType } from "./Breadcrumb";
export type { BreadcrumbType };
export let Breadcrumb: BreadcrumbType;
importTimeout("Breadcrumb", import("./Breadcrumb"), async (mod) => {
  Breadcrumb = await mod.default;
});

import type { ButtonItemType, ButtonType } from "./ButtonItem";
export type { ButtonType, ButtonItemType };
export let Button: ButtonType;
export let ButtonItem: ButtonItemType;
importTimeout("ButtonItem", import("./ButtonItem"), async (mod) => {
  const comps = await mod.default;
  Button = comps.Button;
  ButtonItem = comps.ButtonItem;
});

import type { ClickableType } from "./Clickable";
export type { ClickableType };
export let Clickable: ClickableType;
importTimeout("Clickable", import("./Clickable"), async (mod) => {
  Clickable = await mod.default;
});

import type { CategoryType } from "./Category";
export type { CategoryType };
export let Category: CategoryType;
importTimeout("Category", import("./Category"), async (mod) => {
  Category = await mod.default;
});

import type { TextInputType } from "./TextInput";
export type { TextInputType };
export let TextInput: TextInputType;
importTimeout("TextInput", import("./TextInput"), async (mod) => {
  TextInput = await mod.default;
});

import type { TextAreaType } from "./TextArea";
export type { TextAreaType };
export let TextArea: TextAreaType;
importTimeout("TextArea", import("./TextArea"), async (mod) => {
  TextArea = await mod.default;
});

import type { SliderItemType, SliderType } from "./SliderItem";
export type { SliderType, SliderItemType };
export let Slider: SliderType;
export let SliderItem: SliderItemType;
importTimeout("SliderItem", import("./SliderItem"), async (mod) => {
  const comps = await mod.default;
  Slider = comps.Slider;
  SliderItem = comps.SliderItem;
});

import type { TextType } from "./Text";
export type { TextType };
export let Text: TextType;
importTimeout("Text", import("./Text"), async (mod) => {
  Text = await mod.default;
});

import type { ErrorBoundaryType } from "./ErrorBoundary";
export type { ErrorBoundaryType };
export let ErrorBoundary: ErrorBoundaryType;
importTimeout("ErrorBoundary", import("./ErrorBoundary"), async (mod) => {
  ErrorBoundary = await mod.default;
});

import type { LoaderType } from "./Loader";
export type { LoaderType };
export let Loader: LoaderType;
importTimeout("Loader", import("./Loader"), async (mod) => {
  Loader = await mod.default;
});

import type { CheckboxItemType, CheckboxType } from "./CheckboxItem";
export type { CheckboxType, CheckboxItemType };
export let Checkbox: CheckboxType;
export let CheckboxItem: CheckboxItemType;
importTimeout("CheckboxItem", import("./CheckboxItem"), async (mod) => {
  const comps = await mod.default;
  Checkbox = comps.Checkbox;
  CheckboxItem = comps.CheckboxItem;
});

import type { NoticeType } from "./Notice";
export type { NoticeType };
export let Notice: NoticeType;
importTimeout("Notice", import("./Notice"), async (mod) => {
  Notice = await mod.default;
});

/**
 * @internal
 * @hidden
 */
export const ready = (): Promise<void> =>
  new Promise<void>((resolve) =>
    Promise.allSettled(modulePromises.map((promiseFn) => promiseFn())).then(() => resolve()),
  );
