import type { ModuleExports } from "../../../types";
import { error } from "../logger";

import type * as VoidDesign from "discord-client-types/discord_app/design/void/web";
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

export let Button: VoidDesign.Button;
importTimeout("Button", import("./ButtonItem"), (mod) => (Button = mod.Button));

export let Clickable: typeof Design.Clickable;
importTimeout("Clickable", import("./Clickable"), (mod) => (Clickable = mod.default));

export let ColorPicker: Design.CustomColorPicker;
importTimeout(
  "ColorPicker",
  import("./ColorPickerItem"),
  (mod) => (ColorPicker = mod.CustomColorPicker),
);

export let Divider: Design.FormDivider;
importTimeout("Divider", import("./FormDivider"), (mod) => (Divider = mod.default));

export let FormNotice: Design.FormNotice;
importTimeout("FormNotice", import("./FormNotice"), (mod) => (FormNotice = mod.default));

export let FormSection: Design.FormSection;
importTimeout("FormSection", import("./FormSection"), (mod) => (FormSection = mod.default));

export let Loader: Design.Spinner;
importTimeout("Loader", import("./Spinner"), (mod) => (Loader = mod.default));

export let Radio: VoidDesign.RadioGroup;
importTimeout("Radio", import("./RadioItem"), (mod) => (Radio = mod.RadioGroup));

export let SearchBar: Design.SearchBar;
importTimeout("SearchBar", import("./SearchBar"), (mod) => (SearchBar = mod.default));

export let Switch: VoidDesign.Switch;
importTimeout("Switch", import("./SwitchItem"), (mod) => (Switch = mod.Switch));

export let SwitchItem: Design.FormSwitch;
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (SwitchItem = mod.FormSwitch));

export let TabBar: Design.TabBar;
importTimeout("TabBar", import("./TabBar"), (mod) => (TabBar = mod.default));

export let TextArea: typeof VoidDesign.TextAreaLegacy;
importTimeout("TextArea", import("./TextArea"), (mod) => (TextArea = mod.default));

export let TextInput: Design.TextInput;
importTimeout("TextInput", import("./TextInput"), (mod) => (TextInput = mod.default));

export let Tooltip: Design.TooltipContainer;
importTimeout("Tooltip", import("./Tooltip"), (mod) => (Tooltip = mod.default));

// Other

export let Flex: FlexType;
importTimeout("Flex", import("./Flex"), (mod) => (Flex = mod.default));

// Wrapped

import type { ButtonItemType } from "./ButtonItem";
export type { ButtonItemType };
export let ButtonItem: ButtonItemType;
importTimeout("ButtonItem", import("./ButtonItem"), (mod) => (ButtonItem = mod.ButtonItem));

import type { CustomCheckboxType } from "./CheckboxItem";
export type { CustomCheckboxType };
export let Checkbox: CustomCheckboxType;
importTimeout("Checkbox", import("./CheckboxItem"), (mod) => (Checkbox = mod.Checkbox));

import type { CustomContextMenuType } from "./Menu";
export type { CustomContextMenuType };
export let ContextMenu: CustomContextMenuType;
importTimeout("ContextMenu", import("./Menu"), (mod) => (ContextMenu = mod.default));

import type { CustomFormItemType } from "./FormItem";
export type { CustomFormItemType };
export let FormItem: CustomFormItemType;
importTimeout("FormItem", import("./FormItem"), (mod) => (FormItem = mod.default));

import type { CustomFormTextType } from "./FormText";
export type { CustomFormTextType };
export let FormText: CustomFormTextType;
importTimeout("FormText", import("./FormText"), (mod) => (FormText = mod.CustomFormText));

import type { CustomKeyRecorderType, KeyRecorderItemType } from "./KeyRecorderItem";
export type { CustomKeyRecorderType };
export let KeyRecorder: CustomKeyRecorderType;
importTimeout(
  "KeyRecorder",
  import("./KeyRecorderItem"),
  (mod) => (KeyRecorder = mod.CustomKeyRecorder),
);

export type { KeyRecorderItemType };
export let KeyRecorderItem: KeyRecorderItemType;
importTimeout(
  "KeyRecorderItem",
  import("./KeyRecorderItem"),
  (mod) => (KeyRecorderItem = mod.KeyRecorderItem),
);

import type { CustomModalType } from "./Modal";
export type { CustomModalType };
export let Modal: CustomModalType;
importTimeout("Modal", import("./Modal"), (mod) => (Modal = mod.default));

import type { CustomHelpMessage } from "./HelpMessage";
export type { CustomHelpMessage };
export let Notice: CustomHelpMessage;
importTimeout("Notice", import("./HelpMessage"), (mod) => (Notice = mod.default));

import type { RadioItemType } from "./RadioItem";
export type { RadioItemType };
export let RadioItem: RadioItemType;
importTimeout("RadioItem", import("./RadioItem"), (mod) => (RadioItem = mod.RadioItem));

import type { CustomSingleSelectType, SelectItemType } from "./SelectItem";
export type { CustomSingleSelectType };
export let Select: CustomSingleSelectType;
importTimeout("Select", import("./SelectItem"), (mod) => (Select = mod.CustomSingleSelect));

export type { SelectItemType };
export let SelectItem: SelectItemType;
importTimeout("SelectItem", import("./SelectItem"), (mod) => (SelectItem = mod.SelectItem));

import type { CustomSliderType, SliderItemType } from "./SliderItem";
export type { CustomSliderType };
export let Slider: CustomSliderType;
importTimeout("Slider", import("./SliderItem"), (mod) => (Slider = mod.CustomSlider));

export type { SliderItemType };
export let SliderItem: SliderItemType;
importTimeout("SliderItem", import("./SliderItem"), (mod) => (SliderItem = mod.SliderItem));

import type { CustomTextType } from "./Text";
export type { CustomTextType };
export let Text: CustomTextType;
importTimeout("Text", import("./Text"), (mod) => (Text = mod.default));

// Custom Components

import type { CategoryType } from "./Category";
export type { CategoryType };
export let Category: CategoryType;
importTimeout("Category", import("./Category"), (mod) => (Category = mod.default));

import type { ErrorBoundaryType } from "./ErrorBoundary";
export type { ErrorBoundaryType };
export let ErrorBoundary: ErrorBoundaryType;
importTimeout("ErrorBoundary", import("./ErrorBoundary"), (mod) => (ErrorBoundary = mod.default));

/**
 * @internal
 * @hidden
 */
export const ready = (): Promise<void> =>
  new Promise<void>((resolve) =>
    Promise.allSettled(modulePromises.map((promiseFn) => promiseFn())).then(() => resolve()),
  );
