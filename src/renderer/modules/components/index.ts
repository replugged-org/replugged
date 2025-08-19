import type { ModuleExports } from "../../../types";
import { error } from "../logger";

import type * as Design from "discord-client-types/discord_app/design/web";
import type { Flex as FlexType } from "discord-client-types/discord_app/modules/core/web/Flex";

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
          .catch((err: unknown) => {
            error("Components", name, void 0, `Failed to import component "${name}"`, err);
            rej(err instanceof Error ? err : new Error(String(err)));
          });
      }),
  );
}

// Design System

export let Anchor: Design.Anchor;
importTimeout("Anchor", import("./Anchor"), (mod) => (Anchor = mod.default));

export let Breadcrumbs: typeof Design.Breadcrumbs;
importTimeout("Breadcrumbs", import("./Breadcrumbs"), (mod) => (Breadcrumbs = mod.default));

export let Button: Design.Button;
importTimeout("Button", import("./ButtonItem"), (mod) => (Button = mod.Button));

export let Checkbox: Design.Checkbox;
importTimeout("Checkbox", import("./CheckboxItem"), (mod) => (Checkbox = mod.Checkbox));

export let Clickable: Design.Clickable;
importTimeout("Clickable", import("./Clickable"), (mod) => (Clickable = mod.default));

export let Divider: Design.FormDivider;
importTimeout("Divider", import("./FormDivider"), (mod) => (Divider = mod.default));

export let FormNotice: Design.FormNotice;
importTimeout("FormNotice", import("./FormNotice"), (mod) => (FormNotice = mod.default));

export let FormSection: Design.FormSection;
importTimeout("FormSection", import("./FormSection"), (mod) => (FormSection = mod.default));

export let Loader: Design.Spinner;
importTimeout("Loader", import("./Spinner"), (mod) => (Loader = mod.default));

export let Radio: Design.RadioGroup;
importTimeout("Radio", import("./RadioItem"), (mod) => (Radio = mod.RadioGroup));

export let SearchBar: typeof Design.SearchBar;
importTimeout("SearchBar", import("./SearchBar"), (mod) => (SearchBar = mod.default));

export let Switch: Design.Switch;
importTimeout("Switch", import("./SwitchItem"), (mod) => (Switch = mod.Switch));

export let SwitchItem: Design.FormSwitch;
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (SwitchItem = mod.FormSwitch));

export let TextArea: Design.TextArea;
importTimeout("TextArea", import("./TextArea"), (mod) => (TextArea = mod.default));

export let TextInput: Design.TextInput;
importTimeout("TextInput", import("./TextInput"), (mod) => (TextInput = mod.default));

// Other

export let Flex: FlexType;
importTimeout("Flex", import("./Flex"), (mod) => (Flex = mod.default));

// Wrapped

import type { ButtonItemType } from "./ButtonItem";
export type { ButtonItemType };
export let ButtonItem: ButtonItemType;
importTimeout("ButtonItem", import("./ButtonItem"), (mod) => (ButtonItem = mod.ButtonItem));

import type { CheckboxItemType } from "./CheckboxItem";
export type { CheckboxItemType };
export let CheckboxItem: CheckboxItemType;
importTimeout("CheckboxItem", import("./CheckboxItem"), (mod) => (CheckboxItem = mod.CheckboxItem));

import type { ContextMenuType } from "./ContextMenu";
export type { ContextMenuType };
export let ContextMenu: ContextMenuType;
importTimeout("ContextMenu", import("./ContextMenu"), (mod) => (ContextMenu = mod.default));

import type { CustomFormItemType } from "./FormItem";
export type { CustomFormItemType };
export let FormItem: CustomFormItemType;
importTimeout("FormItem", import("./FormItem"), (mod) => (FormItem = mod.default));

import type { CustomFormTextType } from "./FormText";
export type { CustomFormTextType };
export let FormText: CustomFormTextType;
importTimeout("FormText", import("./FormText"), (mod) => (FormText = mod.CustomFormText));

import type { CustomHelpMessage } from "./HelpMessage";
export type { CustomHelpMessage };
export let Notice: CustomHelpMessage;
importTimeout("Notice", import("./HelpMessage"), (mod) => (Notice = mod.default));

import type { RadioItemType } from "./RadioItem";
export type { RadioItemType };
export let RadioItem: RadioItemType;
importTimeout("RadioItem", import("./RadioItem"), (mod) => (RadioItem = mod.RadioItem));

import type { CustomSliderType, SliderItemType } from "./SliderItem";
export type { CustomSliderType };
export let Slider: CustomSliderType;
importTimeout("Slider", import("./SliderItem"), (mod) => (Slider = mod.CustomSlider));

export type { SliderItemType };
export let SliderItem: SliderItemType;
importTimeout("SliderItem", import("./SliderItem"), (mod) => (SliderItem = mod.SliderItem));

import type { CustomTooltipType } from "./Tooltip";
export type { CustomTooltipType };
export let Tooltip: CustomTooltipType;
importTimeout("Tooltip", import("./Tooltip"), (mod) => (Tooltip = mod.default));

// Custom Components

import type { CategoryType } from "./Category";
export type { CategoryType };
export let Category: CategoryType;
importTimeout("Category", import("./Category"), (mod) => (Category = mod.default));

import type { ErrorBoundaryType } from "./ErrorBoundary";
export type { ErrorBoundaryType };
export let ErrorBoundary: ErrorBoundaryType;
importTimeout("ErrorBoundary", import("./ErrorBoundary"), (mod) => (ErrorBoundary = mod.default));

//

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

import type { TextType } from "./Text";
export type { TextType };
export let Text: TextType;
importTimeout("Text", import("./Text"), (mod) => (Text = mod.default));

/**
 * @internal
 * @hidden
 */
export const ready = (): Promise<void> =>
  new Promise<void>((resolve) =>
    Promise.allSettled(modulePromises.map((promiseFn) => promiseFn())).then(() => resolve()),
  );
