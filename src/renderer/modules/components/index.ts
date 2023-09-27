import type { ModuleExports } from "../../../types";
import { error } from "../logger";

const modulePromises: Array<() => Promise<void>> = [];

function importTimeout<T extends ModuleExports>(
  name: string,
  moduleImport: Promise<T>,
  cb: (mod: T) => void,
): void {
  modulePromises.push(
    () =>
      new Promise<void>((res, rej) => {
        const timeout = setTimeout(() => {
          error("Components", name, void 0, `Could not find component "${name}"`);
          rej(new Error(`Module not found: "${name}`));
        }, 10_000);
        void moduleImport
          .then((mod) => {
            clearTimeout(timeout);
            cb(mod);
            res();
          })
          .catch((err) => {
            error("Components", name, void 0, `Failed to import component "${name}"`, err);
            rej(err);
          });
      }),
  );
}

import type { FlexType } from "./Flex";
export type { FlexType };
export let Flex: FlexType;
importTimeout("Flex", import("./Flex"), (mod) => (Flex = mod.default));

import type { ContextMenuType } from "./ContextMenu";
export type { ContextMenuType };
export let ContextMenu: ContextMenuType;
importTimeout("ContextMenu", import("./ContextMenu"), (mod) => (ContextMenu = mod.default));

import type { SwitchItemType, SwitchType } from "./SwitchItem";
export type { SwitchType };
export let Switch: SwitchType;
importTimeout("Switch", import("./SwitchItem"), (mod) => (Switch = mod.Switch));

export type { SwitchItemType };
export let SwitchItem: SwitchItemType;
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (SwitchItem = mod.SwitchItem));

import type { RadioItemType, RadioType } from "./RadioItem";
export type { RadioType };
export let Radio: RadioType;
importTimeout("Radio", import("./RadioItem"), (mod) => (Radio = mod.Radio));

export type { RadioItemType };
export let RadioItem: RadioItemType;
importTimeout("RadioItem", import("./RadioItem"), (mod) => (RadioItem = mod.RadioItem));

import type { SelectItemType, SelectType } from "./SelectItem";
export type { SelectType };
export let Select: SelectType;
importTimeout("Select", import("./SelectItem"), (mod) => (Select = mod.Select));

export type { SelectItemType };
export let SelectItem: SelectItemType;
importTimeout("SelectItem", import("./SelectItem"), (mod) => (SelectItem = mod.SelectItem));

import type { ModalType } from "./Modal";
export type { ModalType };
export let Modal: ModalType;
importTimeout("Modal", import("./Modal"), (mod) => (Modal = mod.default));

import type { DividerType } from "./Divider";
export type { DividerType };
export let Divider: DividerType;
importTimeout("Divider", import("./Divider"), (mod) => (Divider = mod.default));

import type { TooltipType } from "./Tooltip";
export type { TooltipType };
export let Tooltip: TooltipType;
importTimeout("Tooltip", import("./Tooltip"), (mod) => (Tooltip = mod.default));

import type { FormTextType } from "./FormText";
export type { FormTextType };
export let FormText: FormTextType;
importTimeout("FormText", import("./FormText"), (mod) => (FormText = mod.FormText));

import type { FormItemType } from "./FormItem";
export type { FormItemType };
export let FormItem: FormItemType;
importTimeout("FormItem", import("./FormItem"), (mod) => (FormItem = mod.default));

import type { FormNoticeType } from "./FormNotice";
export type { FormNoticeType };
export let FormNotice: FormNoticeType;
importTimeout("FormNotice", import("./FormNotice"), (mod) => (FormNotice = mod.default));

import type { ButtonItemType, ButtonType } from "./ButtonItem";
export type { ButtonType };
export let Button: ButtonType;
importTimeout("Button", import("./ButtonItem"), (mod) => (Button = mod.Button));

export type { ButtonItemType };
export let ButtonItem: ButtonItemType;
importTimeout("ButtonItem", import("./ButtonItem"), (mod) => (ButtonItem = mod.ButtonItem));

import type { ClickableType } from "./Clickable";
export type { ClickableType };
export let Clickable: ClickableType;
importTimeout("Clickable", import("./Clickable"), (mod) => (Clickable = mod.default));

import type { CategoryType } from "./Category";
export type { CategoryType };
export let Category: CategoryType;
importTimeout("Category", import("./Category"), (mod) => (Category = mod.default));

import type { TextInputType } from "./TextInput";
export type { TextInputType };
export let TextInput: TextInputType;
importTimeout("TextInput", import("./TextInput"), (mod) => (TextInput = mod.default));

import type { TextAreaType } from "./TextArea";
export type { TextAreaType };
export let TextArea: TextAreaType;
importTimeout("TextArea", import("./TextArea"), (mod) => (TextArea = mod.default));

import type { SliderItemType, SliderType } from "./SliderItem";
export type { SliderType };
export let Slider: SliderType;
importTimeout("Slider", import("./SliderItem"), (mod) => (Slider = mod.Slider));

export type { SliderItemType };
export let SliderItem: SliderItemType;
importTimeout("SliderItem", import("./SliderItem"), (mod) => (SliderItem = mod.SliderItem));

import type { TextType } from "./Text";
export type { TextType };
export let Text: TextType;
importTimeout("Text", import("./Text"), (mod) => (Text = mod.default));

import type { ErrorBoundaryType } from "./ErrorBoundary";
export type { ErrorBoundaryType };
export let ErrorBoundary: ErrorBoundaryType;
importTimeout("ErrorBoundary", import("./ErrorBoundary"), (mod) => (ErrorBoundary = mod.default));

import type { LoaderType } from "./Loader";
export type { LoaderType };
export let Loader: LoaderType;
importTimeout("Loader", import("./Loader"), (mod) => (Loader = mod.default));

import type { CheckboxItemType, CheckboxType } from "./CheckboxItem";
export type { CheckboxType };
export let Checkbox: CheckboxType;
importTimeout("Checkbox", import("./CheckboxItem"), (mod) => (Checkbox = mod.Checkbox));

export type { CheckboxItemType };
export let CheckboxItem: CheckboxItemType;
importTimeout("CheckboxItem", import("./CheckboxItem"), (mod) => (CheckboxItem = mod.CheckboxItem));

import type { NoticeType } from "./Notice";
export type { NoticeType };
export let Notice: NoticeType;
importTimeout("Notice", import("./Notice"), (mod) => (Notice = mod.default));

/**
 * @internal
 * @hidden
 */
export const ready = (): Promise<void> =>
  new Promise<void>((resolve) =>
    Promise.allSettled(modulePromises.map((promiseFn) => promiseFn())).then(() => resolve()),
  );
