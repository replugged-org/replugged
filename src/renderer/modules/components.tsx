import { filters, getFunctionBySource, getModule, waitForModule } from './webpack';
import { ModalComponents, ReactComponent, SwitchItem, Menu } from '../../types/components';
import { Filter, ModuleExports, ObjectExports } from '@replugged';
import { error } from "./logger";

async function wrapFilter<T extends ModuleExports | ReactComponent<any>>(name: string, filter: Filter, timeout: number = 5000): Promise<T> {
  return (await waitForModule(filter, {
    timeout
  }).catch(() => {
    // eslint-disable-next-line no-undefined
    error("Replugged", "Components", undefined, `Could not find module ${name}`);
    return null;
  })) as T;
}

const switchItem = wrapFilter<SwitchItem>(
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

const menu = wrapFilter("menu", filters.bySource("♫ ⊂(｡◕‿‿◕｡⊂) ♪")).then((mod) => {
  if (!mod) return null;

  const names = getModule(filters.bySource("menuitemcheckbox"), { raw: true })

  // todo: Finish Populating Menu Components
  return {
    ContextMenu: getFunctionBySource("getContainerProps", mod as ObjectExports),
  }
}) as Promise<Menu>;

export interface Components {
  SwitchItem: SwitchItem,
  modal: ModalComponents,
  menu: Menu,
}

export default async (): Promise<Components> => ({
  SwitchItem: await switchItem,
  modal: await modal,
  menu: await menu,
})
