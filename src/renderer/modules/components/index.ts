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
      }, 5_000);
      void moduleImport.then((mod) => {
        clearTimeout(timeout);
        cb(mod);
        res();
      });
    }),
  );
}

export let ContextMenu: typeof import("./ContextMenu").default;
importTimeout("ContextMenu", import("./ContextMenu"), (mod) => (ContextMenu = mod.default));

export let SwitchItem: typeof import("./SwitchItem");
importTimeout("SwitchItem", import("./SwitchItem"), (mod) => (SwitchItem = mod));

export let Modal: typeof import("./Modal").default;
importTimeout("Modal", import("./Modal"), (mod) => (Modal = mod.default));

await Promise.allSettled(modulePromises);
