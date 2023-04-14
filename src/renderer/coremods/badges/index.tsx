import { filters, getByProps, waitForModule } from "../../modules/webpack";
import { Injector } from "../../modules/injector";
import React from "@common/react";
import type { User } from "discord-types/general";
import { APIBadges, Custom, badgeElements } from "./badge";
import { generalSettings } from "../settings/pages/General";
import { Logger } from "@replugged";
const injector = new Injector();

const logger = Logger.coremod("Badges");

interface BadgeModArgs {
  guildId: string;
  user: User;
}

type BadgeMod = (args: BadgeModArgs) => React.ReactElement<{
  children: React.ReactElement[][];
  className: string;
}>;

interface BadgeCache {
  badges: APIBadges;
  lastFetch: number;
}

// todo: guilds
const cache = new Map<string, BadgeCache>();
const REFRESH_INTERVAL = 1000 * 60 * 30;

export async function start(): Promise<void> {
  const mod = await waitForModule<Record<string, BadgeMod>>(
    filters.bySource(".GUILD_BOOSTER_LEVEL_1,"),
  );
  const fnPropName = Object.entries(mod).find(([_, v]) => typeof v === "function")?.[0];
  if (!fnPropName) {
    throw new Error("Could not find badges function");
  }

  const { containerWithContent } = getByProps<{ containerWithContent: "string" }>(
    "containerWithContent",
  )!;

  injector.after(
    mod,
    fnPropName,
    (
      [
        {
          user: { id },
        },
      ],
      res,
    ) => {
      try {
        if (!generalSettings.get("badges")) return res;

        const [badges, setBadges] = React.useState<APIBadges | undefined>();

        React.useEffect(() => {
          (async () => {
            if (!cache.has(id) || cache.get(id)!.lastFetch < Date.now() - REFRESH_INTERVAL) {
              cache.set(
                id,
                // TODO: new backend
                await fetch(`${generalSettings.get("apiUrl")}/api/v1/users/${id}`)
                  .then(async (res) => {
                    const body = (await res.json()) as Record<string, unknown> & {
                      badges: APIBadges;
                    };

                    if (res.status === 200 || res.status === 404) {
                      return {
                        badges: body.badges || {},
                        lastFetch: Date.now(),
                      };
                    }

                    cache.delete(id);
                    return {
                      badges: {},
                      lastFetch: Date.now(),
                    };
                  })
                  .catch((e) => e),
              );
            }

            setBadges(cache.get(id)?.badges);
          })();
        }, []);

        if (!badges) {
          return res;
        }

        const firstChild = res.props?.children?.[0];
        if (!firstChild || !Array.isArray(firstChild)) {
          logger.error("Error injecting badges: res.props.children[0] is not an array", { res });
          return res;
        }

        if (badges.custom?.name && badges.custom.icon) {
          firstChild.push(<Custom url={badges.custom.icon} name={badges.custom.name} />);
        }

        badgeElements.forEach(({ type, component }) => {
          const value = badges[type];
          if (value) {
            firstChild.push(
              React.createElement(component, {
                color: badges.custom?.color,
              }),
            );
          }
        });

        if (firstChild.length > 0) {
          if (!res.props.className.includes(containerWithContent)) {
            res.props.className += ` ${containerWithContent}`;
          }
          if (!res.props.className.includes("replugged-badges-container")) {
            res.props.className += " replugged-badges-container";
          }
        }

        return res;
      } catch (err) {
        logger.error(err);
        return res;
      }
    },
  );
}

export function stop(): void {
  injector.uninjectAll();
}
