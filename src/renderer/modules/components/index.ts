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

import type { SwitchItemType } from "./SwitchItem";
export type { SwitchItemType };
export let SwitchItem: SwitchItemType;
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (SwitchItem = mod.default));

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

import type { CategoryType } from "./Category";
export type { CategoryType };
export let Category: CategoryType;
importTimeout("Category", import("./Category"), (mod) => (Category = mod.default));

/**
 * @internal
 * @hidden
 */
export const ready = new Promise<void>((resolve) =>
  Promise.allSettled(modulePromises).then(() => resolve()),
);
