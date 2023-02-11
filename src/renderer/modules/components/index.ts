import type { ModuleExports } from "../../../types";
import { error } from "../logger";

const modulePromises: Array<Promise<void>> = [];

function importTimeout<T extends ModuleExports>(
  name: string,
  moduleImport: Promise<T>,
  cb: (mod: T) => void,
): void {
  modulePromises.push(
    new Promise<void>((res, rej) => {
      const timeout = setTimeout(() => {
        error("Components", name, void 0, `Could not find component "${name}"`);
        rej(new Error(`Module not found: "${name}`));
      }, 10_000);
      void moduleImport.then((mod) => {
        clearTimeout(timeout);
        cb(mod);
        res();
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
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (Switch = mod.Switch));

export type { SwitchItemType };
export let SwitchItem: SwitchItemType;
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (SwitchItem = mod.SwitchItem));

import { type RadioItemType, RadioType } from "./RadioItem";
export type { RadioType };
export let Radio: RadioType;
importTimeout("Radio", import("./RadioItem"), (mod) => (Radio = mod.Radio));

export type { RadioItemType };
export let RadioItem: RadioItemType;
importTimeout("RadioItem", import("./RadioItem"), (mod) => (RadioItem = mod.RadioItem));

import { type SelectItemType, SelectType } from "./SelectItem";
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

import type { ButtonItemType, ButtonType } from "./Button";
export type { ButtonType };
export let Button: ButtonType;
importTimeout("Button", import("./Button"), (mod) => (Button = mod.Button));

export type { ButtonItemType };
export let ButtonItem: ButtonItemType;
importTimeout("Button", import("./Button"), (mod) => (ButtonItem = mod.ButtonItem));

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
importTimeout("Input", import("./TextInput"), (mod) => (TextInput = mod.default));

import type { SliderType } from "./Slider";
export type { SliderType };
export let Slider: SliderType;
importTimeout("Slider", import("./Slider"), (mod) => (Slider = mod.default));

import type { TextType } from "./Text";
export type { TextType };
export let Text: TextType;
importTimeout("Text", import("./Text"), (mod) => (Text = mod.default));

import { type ErrorBoundaryType } from "./ErrorBoundary";
export type { ErrorBoundaryType };
export let ErrorBoundary: ErrorBoundaryType;
importTimeout("ErrorBoundary", import("./ErrorBoundary"), (mod) => (ErrorBoundary = mod.default));

import { type LoaderType } from "./Loader";
export type { LoaderType };
export let Loader: LoaderType;
importTimeout("Loader", import("./Loader"), (mod) => (Loader = mod.default));

/**
 * @internal
 * @hidden
 */
export const ready = new Promise<void>((resolve) =>
  Promise.allSettled(modulePromises).then(() => resolve()),
);
