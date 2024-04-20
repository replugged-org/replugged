import React from "@common/react";
import { Logger, util } from "@replugged";
import type { User } from "discord-types/general";
import { Injector } from "../../modules/injector";
import { getByProps, waitForProps } from "../../modules/webpack";
import { generalSettings } from "../settings/pages/General";
import { APIBadges, BadgeSizes, Custom, badgeElements, getBadgeSizeClass } from "./badge";
import { Tree } from "../../util";

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
interface TreeNode {
  children: React.ReactElement[];
}
interface BadgeHighs {
  props: { children: { props: { children: React.ReactElement[] } } };
}
type CombinedTree = Tree & { className: string };

// todo: guilds
const cache = new Map<string, BadgeCache>();
const REFRESH_INTERVAL = 1000 * 60 * 30;

export async function start(): Promise<void> {
  const mod = await waitForProps<{ BadgeSizes: BadgeSizes; default: BadgeMod }>("BadgeSizes");

  const { containerWithContent } = getByProps<{ containerWithContent: "string" }>(
    "containerWithContent",
  )!;

  injector.after(mod, "default", ([props], res: BadgeHighs) => {
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

      const props = util.findInTree(res as unknown as Tree, (x) => Boolean(x?.["aria-label"])) as
        | TreeNode
        | undefined;
      if (!props || !Array.isArray(props.children)) {
        logger.error(
          "Error injecting badges: res.props.children.props.children is not an array",
          props?.children,
        );
        return res;
      }

      // Calculate badge size with new added badges
      const addedBadgesCount =
        props.children.length + Object.values(badges).filter((value) => value).length;
      size =
        shrinkAtCount && shrinkToSize && addedBadgesCount > shrinkAtCount ? shrinkToSize : size;

      const sizeClass = getBadgeSizeClass(size);

      /* I don't even know what this is used for. */
      /* props.children.forEach((badge) => {
        console.log(props)
        const elem: React.ReactElement | undefined = badge.props.children?.();
        if (elem) {
          elem.props.children.props.className = sizeClass;
          badge.props.children = (props: Record<string, unknown>) => {
            elem.props = { ...elem.props, ...props };
            return elem;
          };
        }
      }); */

      if (badges.custom?.name && badges.custom.icon) {
        props.children.push(
          <Custom url={badges.custom.icon} name={badges.custom.name} size={size} />,
        );
      }

      badgeElements.forEach(({ type, component }) => {
        const value = badges[type];
        if (value) {
          props.children.push(
            React.createElement(component, {
              color: badges.custom?.color,
              size,
            }),
          );
        }
      });

      const badgesClassName = util.findInTree(res as unknown as Tree, (x) =>
        Boolean(x?.className),
      ) as CombinedTree;
      if (!badgesClassName) return;
      if (props.children.length > 0) {
        if (!badgesClassName.className.includes(containerWithContent)) {
          badgesClassName.className += ` ${containerWithContent}`;
        }
        if (!badgesClassName.className.includes("replugged-badges-container")) {
          badgesClassName.className += " replugged-badges-container";
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
