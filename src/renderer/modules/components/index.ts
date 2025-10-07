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

export let Checkbox: Design.Checkbox;
importTimeout("Checkbox", import("./Checkbox"), (mod) => (Checkbox = mod.default));

export let Clickable: typeof Design.Clickable;
importTimeout("Clickable", import("./Clickable"), (mod) => (Clickable = mod.default));

export let ColorPicker: Design.ColorPicker;
importTimeout("ColorPicker", import("./ColorPickerItem"), (mod) => (ColorPicker = mod.ColorPicker));

export let Divider: Design.Divider;
importTimeout("Divider", import("./Divider"), (mod) => (Divider = mod.default));

export let FieldSet: Design.FieldSet;
importTimeout("FieldSet", import("./FieldSet"), (mod) => (FieldSet = mod.default));

export let FormControl: Design.FormControl;
importTimeout("FormControl", import("./FormControl"), (mod) => (FormControl = mod.default));

export let FormItem: Design.FormItem;
importTimeout("FormItem", import("./FormItem"), (mod) => (FormItem = mod.default));

export let FormNotice: Design.FormNotice;
importTimeout("FormNotice", import("./FormNotice"), (mod) => (FormNotice = mod.default));

export let FormSection: Design.FormSection;
importTimeout("FormSection", import("./FormSection"), (mod) => (FormSection = mod.default));

export let Loader: Design.Spinner;
importTimeout("Loader", import("./Spinner"), (mod) => (Loader = mod.default));

export let RadioGroup: Design.RadioGroup;
importTimeout("RadioGroup", import("./RadioGroup"), (mod) => (RadioGroup = mod.default));

export let SearchBar: Design.SearchBar;
importTimeout("SearchBar", import("./SearchBar"), (mod) => (SearchBar = mod.default));

export let Stack: Design.Stack;
importTimeout("Stack", import("./Stack"), (mod) => (Stack = mod.default));

export let Switch: Design.Switch;
importTimeout("Switch", import("./Switch"), (mod) => (Switch = mod.default));

export let TabBar: Design.TabBar;
importTimeout("TabBar", import("./TabBar"), (mod) => (TabBar = mod.default));

export let TextArea: Design.TextArea;
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

import type { ColorPickerItemType } from "./ColorPickerItem";
export type { ColorPickerItemType };
export let ColorPickerItem: ColorPickerItemType;
importTimeout(
  "ColorPickerItem",
  import("./ColorPickerItem"),
  (mod) => (ColorPickerItem = mod.default),
);

import type { CustomContextMenuType } from "./Menu";
export type { CustomContextMenuType };
export let ContextMenu: CustomContextMenuType;
importTimeout("ContextMenu", import("./Menu"), (mod) => (ContextMenu = mod.default));

import type { CustomFormTextType } from "./FormText";
export type { CustomFormTextType };
export let FormText: CustomFormTextType;
importTimeout("FormText", import("./FormText"), (mod) => (FormText = mod.CustomFormText));

import type { CustomKeyRecorderType } from "./KeyRecorder";
export type { CustomKeyRecorderType };
export let KeyRecorder: CustomKeyRecorderType;
importTimeout(
  "KeyRecorder",
  import("./KeyRecorder"),
  (mod) => (KeyRecorder = mod.CustomKeyRecorder),
);

import type { CustomModalType } from "./Modal";
export type { CustomModalType };
export let Modal: CustomModalType;
importTimeout("Modal", import("./Modal"), (mod) => (Modal = mod.default));

import type { CustomHelpMessage } from "./HelpMessage";
export type { CustomHelpMessage };
export let Notice: CustomHelpMessage;
importTimeout("Notice", import("./HelpMessage"), (mod) => (Notice = mod.default));

import type { CustomSingleSelectType } from "./Select";
export type { CustomSingleSelectType };
export let Select: CustomSingleSelectType;
importTimeout("Select", import("./Select"), (mod) => (Select = mod.default));

import type { CustomSliderType } from "./Slider";
export type { CustomSliderType };
export let Slider: CustomSliderType;
importTimeout("Slider", import("./Slider"), (mod) => (Slider = mod.default));

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
