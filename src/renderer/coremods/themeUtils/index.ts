import { classNames, components, users } from "@common";
import { Injector, Logger } from "@replugged";
import {
  filters,
  getFunctionBySource,
  getFunctionKeyBySource,
  waitForModule,
  waitForStore,
} from "@webpack";
import type { Message } from "discord-types/general";
import type { Store } from "src/renderer/modules/common/flux";

import type * as Design from "discord-client-types/discord_app/design/web";

const injector = new Injector();

const logger = Logger.coremod("ThemeUtils");

function injectTabBarItemId(): void {
  const TabBar = getFunctionBySource<Design.TabBar>(components, "this.tabBarRef");
  if (!TabBar) {
    logger.error("Failed to find TabBar component");
    return;
  }

  injector.after(
    TabBar.Item.prototype,
    "render",
    (_, res: React.ReactElement<Design.TabBarItemProps>, instance: Design.TabBarItem) => {
      if (typeof instance.props.id === "string") {
        res.props.id = `${instance.props.id.replace(/\s+/g, "-").toLowerCase()}-tab`;
      }
      return res;
    },
  );
}

interface ClientThemesBackgroundStore extends Store {
  gradientPreset: { getName?: () => string } | undefined;
}

interface UseBackgroundGradientCSSResult {
  clientThemesCSS: string;
  clientThemesClassName: string;
}

type UseBackgroundGradientCSS = () => UseBackgroundGradientCSSResult;

async function injectCustomThemeClass(): Promise<void> {
  const ClientThemesBackgroundStore = await waitForStore<ClientThemesBackgroundStore>(
    "ClientThemesBackgroundStore",
  );

  const useBackgroundGradientCSSMod = await waitForModule<Record<string, UseBackgroundGradientCSS>>(
    filters.bySource("data-client-themes"),
  );
  const fnKey = getFunctionKeyBySource(useBackgroundGradientCSSMod, "clientThemesClassName");
  if (!fnKey) {
    logger.error("Failed to find useBackgroundGradientCSS function");
    return;
  }

  injector.after(useBackgroundGradientCSSMod, fnKey, (_, res) => {
    if (!res.clientThemesClassName) return res;

    const gradientName = ClientThemesBackgroundStore.gradientPreset?.getName?.();
    if (!gradientName) return res;

    const customThemeName = gradientName.replace(/\s+/g, "-").toLowerCase();

    res.clientThemesClassName = classNames(customThemeName, res.clientThemesClassName);
    return res;
  });
}

/**
 * @internal
 */
export function _insertMessageAttributes(
  message: Message & { ignored: boolean; author: { globalName: string } },
): Record<string, string | number | boolean | undefined> {
  return {
    "data-is-author-self": message.author.id === users.getCurrentUser().id,
    "data-is-author-bot": message.author.bot,
    "data-is-author-webhook": Boolean(message.webhookId),
    "data-author-username": message.author.username,
    "data-author-global-name": message.author.globalName,
    "data-author-id": message.author.id,
    "data-channel-id": message.channel_id,
    "data-is-reply": Boolean(message.messageReference),
    "data-message-type": message.type,
    "data-is-ignored": message.ignored,
    "data-is-blocked": message.blocked,
    "data-is-interaction": Boolean(message.interaction),
    "data-is-pinned": message.pinned,
    "data-is-call": Boolean(message.call),
    "data-is-spam": message.hasFlag(1 << 20),
  };
}

/**
 * @internal
 */
export function _insertAvatarAttributes({
  status,
  isTyping,
  isMobile,
  src,
  size,
  "aria-label": ariaLabel,
}: {
  status: boolean;
  isTyping: boolean;
  isMobile: boolean;
  size: string;
  src: string;
  "aria-label": string;
}): Record<string, string | number | boolean | undefined> {
  return {
    "data-status": status,
    "data-is-typing": isTyping,
    "data-is-mobile": isMobile,
    "data-user-id": /\/avatars\/(\d+?)\//.exec(src)?.[1],
    "data-size": size,
    "data-user-username": ariaLabel,
  };
}

export async function start(): Promise<void> {
  injectTabBarItemId();
  await injectCustomThemeClass();
}

export function stop(): void {
  injector.uninjectAll();
}
