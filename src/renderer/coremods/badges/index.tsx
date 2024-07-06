import { Messages } from "@common/i18n";
import React from "@common/react";
import { Logger } from "@replugged";
import { filters, getFunctionKeyBySource, waitForModule } from "@webpack";
import { DISCORD_BLURPLE, DISCORD_INVITE, WEBLATE_URL } from "src/constants";
import type { Badge, DisplayProfile } from "src/types";
import { Injector } from "../../modules/injector";
import { generalSettings } from "../settings/pages";
import "./badge.css";
import Badges from "./badges";

const injector = new Injector();

const logger = Logger.coremod("Badges");

type RepluggedBadge = Badge & {
  component?: React.ReactElement;
};

interface APIRepluggedCustomBadge {
  name: string | null;
  icon: string | null;
  color: string | null;
}

interface APIRepluggedBadges {
  [key: string]: boolean | APIRepluggedCustomBadge;
  developer: boolean;
  staff: boolean;
  support: boolean;
  contributor: boolean;
  translator: boolean;
  hunter: boolean;
  early: boolean;
  booster: boolean;
  custom: APIRepluggedCustomBadge;
}

type UseBadges = (displayProfile: DisplayProfile | null) => Badge[];

type GetBadgeAsset = (icon: string) => string;

interface BadgeCache {
  badges: APIRepluggedBadges;
  lastFetch: number;
}

const cache = new Map<string, BadgeCache>();
const REFRESH_INTERVAL = 1000 * 60 * 30;

const contributorsUrl = `${generalSettings.get("apiUrl")}/contributors`;
const inviteUrl = `https://discord.gg/${DISCORD_INVITE}`;

const badgeElements = [
  {
    id: "booster",
    description: Messages.REPLUGGED_BADGES_BOOSTER,
    component: Badges.Booster,
    link: inviteUrl,
  },
  {
    id: "contributor",
    description: Messages.REPLUGGED_BADGES_CONTRIBUTOR,
    component: Badges.Contributor,
    link: contributorsUrl,
  },
  {
    id: "developer",
    description: Messages.REPLUGGED_BADGES_DEVELOPER,
    component: Badges.Developer,
    link: contributorsUrl,
  },
  { id: "early", description: Messages.REPLUGGED_BADGES_EARLY, component: Badges.EarlyUser },
  { id: "hunter", description: Messages.REPLUGGED_BADGES_HUNTER, component: Badges.BugHunter },
  {
    id: "staff",
    description: Messages.REPLUGGED_BADGES_STAFF,
    component: Badges.Staff,
    link: inviteUrl,
  },
  {
    id: "support",
    description: Messages.REPLUGGED_BADGES_SUPPORT,
    component: Badges.Support,
    link: inviteUrl,
  },
  {
    id: "translator",
    description: Messages.REPLUGGED_BADGES_TRANSLATOR,
    component: Badges.Translator,
    link: WEBLATE_URL,
  },
];

export async function start(): Promise<void> {
  const useBadgesMod = await waitForModule<Record<string, UseBadges>>(
    filters.bySource(/:\w+\.getBadges\(\)/),
  );
  const useBadgesKey = getFunctionKeyBySource(useBadgesMod, "")!;

  injector.after(useBadgesMod, useBadgesKey, ([displayProfile], badges) => {
    if (!generalSettings.get("badges")) return badges;

    try {
      const [currentCache, setCurrentCache] = React.useState<APIRepluggedBadges | undefined>();
      const badgeCache = React.useMemo(() => {
        if (!displayProfile) return currentCache;

        const { userId } = displayProfile;

        (async () => {
          if (!cache.has(userId) || cache.get(userId)!.lastFetch < Date.now() - REFRESH_INTERVAL) {
            cache.set(
              userId,
              await fetch(`${generalSettings.get("apiUrl")}/api/v1/users/${userId}`)
                .then(async (res) => {
                  const body = await res.json();

                  if (res.status === 200 || res.status === 404) {
                    return {
                      badges: body.badges || {},
                      lastFetch: Date.now(),
                    };
                  }

                  cache.delete(userId);
                  return {
                    badges: {},
                    lastFetch: Date.now(),
                  };
                })
                .catch((e) => e),
            );
          }

          setCurrentCache(cache.get(userId)?.badges);
        })();

        return currentCache;
      }, [currentCache, displayProfile]);

      if (!badgeCache) return badges;

      let newBadges: RepluggedBadge[] = [];

      if (badgeCache.custom.name && badgeCache.custom.icon) {
        newBadges.push({
          id: badgeCache.custom.name,
          description: badgeCache.custom.name,
          icon: `replugged${badgeCache.custom.icon}`,
        });
      }

      badgeElements.forEach((badgeElement) => {
        if (badgeCache[badgeElement.id]) {
          const { component, ...props } = badgeElement;

          newBadges.push({
            ...props,
            icon: "replugged",
            component: React.createElement(component, {
              color: badgeCache.custom.color ?? DISCORD_BLURPLE,
            }),
          });
        }
      });

      return [...badges, ...newBadges];
    } catch (err) {
      logger.error(err);
      return badges;
    }
  });

  const userProfileConstantsMod = await waitForModule<Record<string, GetBadgeAsset>>(
    filters.bySource(/concat\(\w+,"\/badge-icons\/"/),
  );
  const getBadgeAssetKey = getFunctionKeyBySource(userProfileConstantsMod, "badge-icons")!;

  injector.instead(userProfileConstantsMod, getBadgeAssetKey, (args, orig) => {
    if (args[0].startsWith("replugged")) return args[0].replace("replugged", "");
    return orig(...args);
  });
}

export function stop(): void {
  injector.uninjectAll();
}
