import { React, i18n } from "@common";
import { Logger } from "@recelled";
import { filters, getFunctionKeyBySource, waitForModule } from "@webpack";
import { DISCORD_BLURPLE, DISCORD_INVITE, WEBLATE_URL } from "src/constants";
import { t } from "src/renderer/modules/i18n";
import type { Badge, DisplayProfile } from "src/types";
import { Injector } from "../../modules/injector";
import { generalSettings } from "../settings/pages";
import Badges from "./badges";

import "./badge.css";

const injector = new Injector();

const logger = Logger.coremod("Badges");

type ReCelledBadge = Badge & {
  component?: React.ReactElement;
};

interface APIReCelledCustomBadge {
  name: string | null;
  icon: string | null;
  color: string | null;
}

interface APIReCelledBadges {
  developer: boolean;
  staff: boolean;
  support: boolean;
  contributor: boolean;
  translator: boolean;
  hunter: boolean;
  early: boolean;
  booster: boolean;
  custom: APIReCelledCustomBadge;
}

type UseBadges = (displayProfile: DisplayProfile | null) => Badge[];

type GetBadgeAsset = (icon: string) => string;

interface BadgeCache {
  badges: APIReCelledBadges;
  lastFetch: number;
}

const cache = new Map<string, BadgeCache>();
const REFRESH_INTERVAL = 1000 * 60 * 30;

const contributorsUrl = `${generalSettings.get("apiUrl")}/contributors`;
const inviteUrl = `https://discord.gg/${DISCORD_INVITE}`;

const badgeElements = [
  {
    id: "booster",
    description: i18n.intl.string(t.RECELLED_BADGES_BOOSTER),
    component: Badges.Booster,
    link: inviteUrl,
  },
  {
    id: "contributor",
    description: i18n.intl.string(t.RECELLED_BADGES_CONTRIBUTOR),
    component: Badges.Contributor,
    link: contributorsUrl,
  },
  {
    id: "developer",
    description: i18n.intl.string(t.RECELLED_BADGES_DEVELOPER),
    component: Badges.Developer,
    link: contributorsUrl,
  },
  {
    id: "early",
    description: i18n.intl.string(t.RECELLED_BADGES_EARLY),
    component: Badges.EarlyUser,
  },
  {
    id: "hunter",
    description: i18n.intl.string(t.RECELLED_BADGES_HUNTER),
    component: Badges.BugHunter,
  },
  {
    id: "staff",
    description: i18n.intl.string(t.RECELLED_BADGES_STAFF),
    component: Badges.Staff,
    link: inviteUrl,
  },
  {
    id: "support",
    description: i18n.intl.string(t.RECELLED_BADGES_SUPPORT),
    component: Badges.Support,
    link: inviteUrl,
  },
  {
    id: "translator",
    description: i18n.intl.string(t.RECELLED_BADGES_TRANSLATOR),
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
      const [currentCache, setCurrentCache] = React.useState<APIReCelledBadges | undefined>();
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

      let newBadges: ReCelledBadge[] = [];

      if (badgeCache.custom.name && badgeCache.custom.icon) {
        newBadges.push({
          id: badgeCache.custom.name,
          description: badgeCache.custom.name,
          icon: `recelled${badgeCache.custom.icon}`,
        });
      }

      badgeElements.forEach((badgeElement) => {
        if (badgeCache[badgeElement.id as keyof APIReCelledBadges]) {
          const { component, ...props } = badgeElement;
          const badgeColor = badgeCache.custom.color;

          newBadges.push({
            ...props,
            icon: "recelled",
            component: React.createElement(component, {
              color:
                (badgeColor && (badgeColor.startsWith("#") ? badgeColor : `#${badgeColor}`)) ??
                DISCORD_BLURPLE,
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
    if (args[0].startsWith("recelled")) return args[0].replace("recelled", "");
    return orig(...args);
  });
}

export function stop(): void {
  injector.uninjectAll();
}
