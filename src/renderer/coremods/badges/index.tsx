import { filters, getByProps, waitForModule } from "../../modules/webpack";
import { Injector } from "../../modules/injector";
import React from "../../modules/webpack/common/react";
import { User } from "discord-types/general";
import { getBadges } from "./badge";
const injector = new Injector();

interface BadgeArgs {
  guildId: string;
  user: User;
}

type BadgeMod = (args: BadgeArgs) => React.ReactElement<{
  children: React.ReactElement[];
  className: string;
}>;

interface APIBadges {
  developer?: boolean;
  staff?: boolean;
  support?: boolean;
  contributor?: boolean;
  translator?: boolean;
  hunter?: boolean;
  early?: boolean;
  booster?: boolean;
  custom?: {
    name: string;
    icon?: string;
    color?: string;
  };
}

type BadgeCache = {
  badges: APIBadges;
  lastFetch: number;
};

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

  const Badge = await getBadges();

  const { containerWithContent } = getByProps("containerWithContent") as Record<string, string>;

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
      if (!res?.props?.children) return res;

      const [badges, setBadges] = React.useState<APIBadges | null>(null);

      React.useEffect(() => {
        (async () => {
          if (!cache.has(id) || cache.get(id)!.lastFetch < Date.now() - REFRESH_INTERVAL) {
            cache.set(
              id,
              // TODO: new backend
              await fetch(`https://replugged.dev/api/v1/users/${id}`)
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

          setBadges(cache.get(id)?.badges || null);
        })();
      }, []);

      if (!badges) {
        return res;
      }

      if (badges.custom && badges.custom.name && badges.custom.icon) {
        res.props.children.push(
          <Badge.Custom url={badges.custom.icon} name={badges.custom.name} />,
        );
      }
      if (badges.booster) {
        res.props.children.push(<Badge.Booster color={badges.custom?.color} />);
      }
      if (badges.hunter) {
        res.props.children.push(<Badge.BugHunter color={badges.custom?.color} />);
      }
      if (badges.contributor) {
        res.props.children.push(<Badge.Contributor color={badges.custom?.color} />);
      }
      if (badges.developer) {
        res.props.children.push(<Badge.Developer color={badges.custom?.color} />);
      }
      if (badges.early) {
        res.props.children.push(<Badge.EarlyUser color={badges.custom?.color} />);
      }
      if (badges.staff) {
        res.props.children.push(<Badge.Staff color={badges.custom?.color} />);
      }
      if (badges.support) {
        res.props.children.push(<Badge.Support color={badges.custom?.color} />);
      }
      if (badges.translator) {
        res.props.children.push(<Badge.Translator color={badges.custom?.color} />);
      }

      if (res.props.children.length > 0) {
        if (!res.props.className.includes(containerWithContent)) {
          res.props.className += ` ${containerWithContent}`;
        }
        if (!res.props.className.includes("replugged-badges-container")) {
          res.props.className += " replugged-badges-container";
        }
      }

      return res;
    },
  );
}

export function stop(): void {
  injector.uninjectAll();
}
