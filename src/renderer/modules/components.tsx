import { filters, waitForModule, getFunctionBySource } from './webpack';
import { ModalComponents } from '../../types/components';
import { ModuleExports, Filter, ObjectExports } from '@replugged';
import { error } from "./logger";

async function wrapFilter<T extends ModuleExports | React.ComponentType>(name: string, filter: Filter, timeout: number = 5000): Promise<T> {
  return (await waitForModule(filter, {
    timeout
  }).catch(() => {
    // eslint-disable-next-line no-undefined
    error("Replugged", "Components", undefined, `Could not find module ${name}`);
    return null;
  })) as T;
}

const SwitchItem = wrapFilter<React.ComponentType>(
  "SwitchItem",
  filters.bySource(/=.\.helpdeskArticleId,.=.\.children/),
  10000
);

const modal = wrapFilter("modal", filters.bySource("().closeWithCircleBackground")).then((mod) => {
  if (!mod) return null;

  return {
    ModalRoot: getFunctionBySource("().root", mod as ObjectExports),
    ModalHeader: getFunctionBySource("().header", mod as ObjectExports),
    ModalContent: getFunctionBySource("().content", mod as ObjectExports),
    ModalFooter: getFunctionBySource("().footerSeparator", mod as ObjectExports),
    ModalCloseButton: getFunctionBySource("().closeWithCircleBackground", mod as ObjectExports),
  }
}) as Promise<ModalComponents>;

export interface Components {
  SwitchItem: React.ComponentType,
  modal: ModalComponents,
}

export default async (): Promise<Components> => ({
  SwitchItem: await SwitchItem,
  modal: await modal,
})
