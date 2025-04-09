import { intl } from "@common/i18n";
import React from "@common/react";
import { Logger } from "@replugged";
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

type RepluggedBadge = Badge & {
  component?: React.ReactElement;
};

interface APIRepluggedCustomBadge {
  name: string | null;
  icon: string | null;
  color: string | null;
}

interface APIRepluggedBadges {
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
    description: intl.string(t.REPLUGGED_BADGES_BOOSTER),
    component: Badges.Booster,
    link: inviteUrl,
  },
  {
    id: "contributor",
    description: intl.string(t.REPLUGGED_BADGES_CONTRIBUTOR),
    component: Badges.Contributor,
    link: contributorsUrl,
  },
  {
    id: "developer",
    description: intl.string(t.REPLUGGED_BADGES_DEVELOPER),
    component: Badges.Developer,
    link: contributorsUrl,
  },
  { id: "early", description: intl.string(t.REPLUGGED_BADGES_EARLY), component: Badges.EarlyUser },
  {
    id: "hunter",
    description: intl.string(t.REPLUGGED_BADGES_HUNTER),
    component: Badges.BugHunter,
  },
  {
    id: "staff",
    description: intl.string(t.REPLUGGED_BADGES_STAFF),
    component: Badges.Staff,
    link: inviteUrl,
  },
  {
    id: "support",
    description: intl.string(t.REPLUGGED_BADGES_SUPPORT),
    component: Badges.Support,
    link: inviteUrl,
  },
  {
    id: "translator",
    description: intl.string(t.REPLUGGED_BADGES_TRANSLATOR),
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

    const [badgeCache, setBadgeCache] = React.useState<APIRepluggedBadges | undefined>();

    React.useEffect(() => {
      if (!displayProfile) return;

      const { userId } = displayProfile;

      async function fetchBadges(): Promise<void> {
        if (cache.has(userId) && cache.get(userId)!.lastFetch >= Date.now() - REFRESH_INTERVAL) {
          setBadgeCache(cache.get(userId)!.badges);
          return;
        }

        try {
          const response = await fetch(`${generalSettings.get("apiUrl")}/api/v1/users/${userId}`);
          const body = await response.json();

          const badges: APIRepluggedBadges =
            response.status === 200 || response.status === 404 ? body.badges || {} : {};
          cache.set(userId, { badges, lastFetch: Date.now() });

          setBadgeCache(badges);
        } catch (error) {
          logger.error("Failed to fetch badges:", error);
        }
      }

      void fetchBadges();
    }, [displayProfile]);

    const newBadges = React.useMemo(() => {
      if (!badgeCache) return [];

      const newBadges: RepluggedBadge[] = [];

      if (badgeCache.custom.name && badgeCache.custom.icon) {
        newBadges.push({
          id: badgeCache.custom.name,
          description: badgeCache.custom.name,
          icon: `replugged${badgeCache.custom.icon}`,
        });
      }

      badgeElements.forEach(({ component, ...props }) => {
        if (badgeCache[props.id as keyof APIRepluggedBadges]) {
          newBadges.push({
            ...props,
            icon: "replugged",
            component: React.createElement(component, {
              color:
                (badgeCache.custom.color &&
                  (badgeCache.custom.color.startsWith("#")
                    ? badgeCache.custom.color
                    : `#${badgeCache.custom.color}`)) ??
                DISCORD_BLURPLE,
            }),
          });
        }
      });

      return newBadges;
    }, [badgeCache]);

    return [...badges, ...newBadges];
  });

  const userProfileConstantsMod = await waitForModule<Record<string, GetBadgeAsset>>(
    filters.bySource(/concat\(\w+,"\/badge-icons\/"/),
  );
  const getBadgeAssetKey = getFunctionKeyBySource(userProfileConstantsMod, "badge-icons")!;

  injector.instead(userProfileConstantsMod, getBadgeAssetKey, ([icon], orig) =>
    icon.startsWith("replugged") ? icon.replace("replugged", "") : orig(icon),
  );
}

export function stop(): void {
  injector.uninjectAll();
}
