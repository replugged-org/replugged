import { ModuleExports } from "../../../types";
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
        error("Replugged", "Components", void 0, `Could not find module "${name}"`);
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

export let Flex: typeof import("./Flex").default;
importTimeout("Flex", import("./Flex"), (mod) => (Flex = mod.default));

export let ContextMenu: typeof import("./ContextMenu").default;
importTimeout("ContextMenu", import("./ContextMenu"), (mod) => (ContextMenu = mod.default));

export let SwitchItem: typeof import("./SwitchItem").default;
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (SwitchItem = mod.default));

export let Modal: typeof import("./Modal").default;
importTimeout("Modal", import("./Modal"), (mod) => (Modal = mod.default));

export let Divider: typeof import("./Divider").default;
importTimeout("Divider", import("./Divider"), (mod) => (Divider = mod.default));

export let Tooltip: typeof import("./Tooltip").default;
importTimeout("Tooltip", import("./Tooltip"), (mod) => (Tooltip = mod.default));

export let FormText: typeof import("./FormText").default;
importTimeout("FormText", import("./FormText"), (mod) => (FormText = mod.default));

export let FormItem: typeof import("./FormItem").default;
importTimeout("FormItem", import("./FormItem"), (mod) => (FormItem = mod.default));

export let Button: typeof import("./Button").Button;
importTimeout("Button", import("./Button"), (mod) => (Button = mod.Button));

export let ButtonItem: typeof import("./Button").ButtonItem;
importTimeout("Button", import("./Button"), (mod) => (ButtonItem = mod.ButtonItem));

export let Category: typeof import("./Category").default;
importTimeout("Category", import("./Category"), (mod) => (Category = mod.default));

await Promise.allSettled(modulePromises);
