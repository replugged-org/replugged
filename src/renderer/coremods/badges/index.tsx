import React from "@common/react";
import { Logger } from "@replugged";
import type { User } from "discord-types/general";
import { Injector } from "../../modules/injector";
import { getByProps, waitForProps } from "../../modules/webpack";
import { generalSettings } from "../settings/pages/General";
import { APIBadges, BadgeSizes, Custom, badgeElements, getBadgeSizeClass } from "./badge";

const injector = new Injector();

const logger = Logger.coremod("Badges");

interface BadgeModArgs {
  user: User;
  guildId: string;
  className?: string;
  shrinkAtCount?: number;
  shrinkToSize?: number;
  isTryItOutFlow?: boolean;
  size?: BadgeSizes;
}

type BadgeMod = (args: BadgeModArgs) =>
  | React.ReactElement<{
      children?: React.ReactElement[];
      className: string;
    }>
  | undefined;

interface BadgeCache {
  badges: APIBadges;
  lastFetch: number;
}

// todo: guilds
const cache = new Map<string, BadgeCache>();
const REFRESH_INTERVAL = 1000 * 60 * 30;

export async function start(): Promise<void> {
  const mod = await waitForProps<{ BadgeSizes: BadgeSizes; default: BadgeMod }>("BadgeSizes");

  const { containerWithContent } = getByProps<{ containerWithContent: "string" }>(
    "containerWithContent",
  )!;

  injector.after(mod, "default", ([props], res) => {
    let {
      user: { id },
      shrinkAtCount,
      shrinkToSize,
      size,
    } = props;

    try {
      if (!generalSettings.get("badges")) return res;

      const [currentCache, setCurrentCache] = React.useState<APIBadges | undefined>();
      const badges = React.useMemo(() => {
        (async () => {
          if (!cache.has(id) || cache.get(id)!.lastFetch < Date.now() - REFRESH_INTERVAL) {
            cache.set(
              id,
              // TODO: new backend
              await fetch(`${generalSettings.get("apiUrl")}/api/v1/users/${id}`)
                .then(async (res) => {
                  const body = (await res.json()) as Record<string, unknown> & {
                    badges: APIBadges | undefined;
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

          setCurrentCache(cache.get(id)?.badges);
        })();

        return currentCache;
      }, [currentCache, id]);

      if (!badges) {
        return res;
      }
      const children = res?.props.children;
      if (!children || !Array.isArray(children)) {
        logger.error("Error injecting badges: res.props.children is not an array", { children });
        return res;
      }

      // Calculate badge size with new added badges
      const addedBadgesCount =
        children.length + Object.values(badges).filter((value) => value).length;
      size =
        shrinkAtCount && shrinkToSize && addedBadgesCount > shrinkAtCount ? shrinkToSize : size;

      const sizeClass = getBadgeSizeClass(size);

      children.forEach((badge) => {
        const elem: React.ReactElement | undefined = badge.props.children?.();
        if (elem) {
          elem.props.children.props.className = sizeClass;
          badge.props.children = (props: Record<string, unknown>) => {
            elem.props = { ...elem.props, ...props };
            return elem;
          };
        }
      });

      if (badges.custom?.name && badges.custom.icon) {
        children.push(<Custom url={badges.custom.icon} name={badges.custom.name} size={size} />);
      }

      badgeElements.forEach(({ type, component }) => {
        const value = badges[type];
        if (value) {
          children.push(
            React.createElement(component, {
              color: badges.custom?.color,
              size,
            }),
          );
        }
      });

      if (children.length > 0) {
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
  });
}

export function stop(): void {
  injector.uninjectAll();
}
