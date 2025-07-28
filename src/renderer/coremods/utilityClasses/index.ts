import { Injector } from "@replugged";
import {
  filters,
  getFunctionBySource,
  getFunctionKeyBySource,
  waitForModule,
  waitForStore,
} from "src/renderer/modules/webpack";
import { classNames, components, users } from "@common";
import type React from "react";
import type { Store } from "src/renderer/modules/common/flux";
import type { Message } from "discord-types/general";

const injector = new Injector();

interface TabBarItemProps {
  id: string;
}

interface TabBarItemType extends React.Component<TabBarItemProps> {
  render(): React.ReactElement<TabBarItemProps>;
}

function tabBarItemId(): void {
  const TabBar = getFunctionBySource<{ Item: { prototype: TabBarItemType } }>(
    components,
    "this.tabBarRef",
  );
  if (!TabBar) {
    throw new Error("Failed to find TabBar module!");
  }

  // @ts-expect-error https://github.com/replugged-org/replugged/pull/718
  injector.after(TabBar.Item.prototype, "render", (_, res, instance: TabBarItemType) => {
    if (typeof instance.props.id === "string") {
      res.props.id = `${instance.props.id.replace(/\s+/g, "-").toLowerCase()}-tab`;
    }
    return res;
  });
}

interface ClientThemesBackgroundStore extends Store {
  gradientPreset: { getName: () => string } | undefined;
}

async function customThemeClass(): Promise<void> {
  const ClientThemesBackgroundStore = await waitForStore<ClientThemesBackgroundStore>(
    "ClientThemesBackgroundStore",
  );
  const clientThemeStyleMod = await waitForModule<
    Record<string, () => { clientThemesClassName?: string; clientThemesCSS?: string }>
  >(filters.bySource("data-client-themes"));

  const fnKey = getFunctionKeyBySource(clientThemeStyleMod, "clientThemesClassName")!;

  injector.after(clientThemeStyleMod, fnKey, (_, res) => {
    if (!res.clientThemesClassName) return res;
    const customThemeName = ClientThemesBackgroundStore.gradientPreset
      ?.getName()
      .replace(" ", "-")
      .toLowerCase();
    res.clientThemesClassName = classNames(customThemeName, res.clientThemesClassName);
    return res;
  });
}

/**
 * @internal
 * @hidden
 */
export function _insertMessageAttributes(
  message: Message,
): Record<string, string | number | boolean> {
  return {
    "data-is-author-self": message.author.id === users.getCurrentUser().id,
    "data-is-author-bot": message.author.bot,
    "data-is-author-webhook": Boolean(message.webhookId),
    "data-author-id": message.author.id,
    "data-message-type": message.type,
    "data-is-blocked": message.blocked,
  };
}

export async function start(): Promise<void> {
  tabBarItemId();
  await customThemeClass();
}

export function stop(): void {
  injector.uninjectAll();
}
