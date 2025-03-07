import { React, channels, flux, fluxDispatcher, guilds } from "@common";
import type { Fiber } from "react-reconciler";
import type { Jsonifiable } from "type-fest";
import type { ObjectExports } from "../types";
import { SettingsManager } from "./apis/settings";
import { getByProps, getBySource, getFunctionBySource } from "./modules/webpack";

/**
 * Loads a stylesheet into the document
 * @param path Path to the stylesheet
 * @returns Link element
 */
export const loadStyleSheet = (path: string): HTMLLinkElement => {
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = `${path}?t=${Date.now()}`;
  document.body.appendChild(el);

  return el;
};

/**
 * Wait for an element to be added to the DOM
 * @param selector Element selector
 */
export async function waitFor(selector: string): Promise<Element> {
  let element: Element | null = null;

  while (!element) {
    element = document.querySelector(selector);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return element;
}

/**
 * Async sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get the React instance of an element
 * @param element Element to get the React instance of
 * @returns React instance
 * @throws If the React instance could not be found
 */
export function getReactInstance(element: Element): Fiber | null {
  const keys = Object.keys(element);
  const reactKey = keys.find((key) => key.startsWith("__reactFiber$"));
  if (!reactKey) {
    throw new Error("Could not find react fiber");
  }
  // @ts-expect-error Doesn't like the dynamic key I guess
  return element[reactKey];
}

/**
 * Get the React owner instance of an element
 * @param element Element to get the React owner instance of
 * @returns React owner instance
 * @throws If the React owner instance could not be found
 */
export function getOwnerInstance(element: Element): React.Component & Record<string, unknown> {
  let current = getReactInstance(element);
  while (current) {
    const owner = current.stateNode;
    if (owner && !(owner instanceof Element)) {
      return owner;
    }
    current = current.return;
  }
  throw new Error("Could not find react owner");
}

/**
 * Force updates a rendered React component by its DOM selector
 * @param selector The DOM selector to force update
 * @param all Whether all elements matching that selector should be force updated
 */
export function forceUpdateElement(selector: string, all = false): void {
  const elements = (
    all ? [...document.querySelectorAll(selector)] : [document.querySelector(selector)]
  ).filter(Boolean) as Element[];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- May not actually have forceUpdate
  elements.forEach((element) => getOwnerInstance(element)?.forceUpdate());
}

type Invite = Record<string, unknown> & {
  channel: {
    name: string;
    id: string;
    type: number;
  };
  guild: Record<string, unknown> & {
    id: string;
  };
};

interface ResolvedInvite {
  code: string;
  invite: Invite;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type GetInviteMod = {
  getInvite: (invite: string) => Invite | undefined;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ResolveInviteMod = {
  resolveInvite: (invite: string) => Promise<ResolvedInvite | undefined>;
};

let getInvite: GetInviteMod["getInvite"] | undefined;
let resolveInvite: ResolveInviteMod["resolveInvite"] | undefined;
let transitionTo: ((route: string) => void | undefined) | undefined;

/**
 * If the user is not in the server, join it. Otherwise, go to the server.
 * @param invite Invite code (eg "recelled")
 */
export async function goToOrJoinServer(invite: string): Promise<void> {
  if (!getInvite || !resolveInvite || !transitionTo) {
    getInvite = getByProps<GetInviteMod>("getInvite")?.getInvite;
    if (!getInvite) {
      throw new Error("Could not find getInvite");
    }

    resolveInvite = getByProps<ResolveInviteMod>("resolveInvite")?.resolveInvite;
    if (!resolveInvite) {
      throw new Error("Could not find resolveInvite");
    }

    const transitionToMod = getBySource("Transitioning to");
    if (!transitionToMod) {
      throw new Error("Could not find transitionTo");
    }

    transitionTo = getFunctionBySource(transitionToMod as ObjectExports, "Transitioning to");
    if (!transitionTo) {
      throw new Error("Could not find transitionTo");
    }
  }

  const inviteData = getInvite(invite) || (await resolveInvite(invite))?.invite;
  if (!inviteData) {
    throw new Error("Could not resolve invite");
  }

  const {
    channel: { id: channelId },
    guild: { id: guildId },
  } = inviteData;

  if (guilds.getGuild(guildId)) {
    // Guild already joined
    const lastChannelId = channels.getChannelId(guildId);
    transitionTo(`/channels/${guildId}/${lastChannelId || channelId}`);
    return;
  }

  fluxDispatcher.dispatch({
    type: "INVITE_MODAL_OPEN",
    context: "APP",
    invite: inviteData,
    code: invite,
  });
}

export async function openExternal(url: string): Promise<void> {
  const mod = getBySource<(url: string) => Promise<void>>(/href=\w,\w\.target="_blank"/);
  if (!mod) {
    throw new Error("Could not find openExternal");
  }
  await mod(url);
}

type ValType<T> =
  | T
  | React.ChangeEvent<HTMLInputElement>
  | (Record<string, unknown> & { value?: T; checked?: T });

export function useSetting<
  T extends Record<string, Jsonifiable>,
  D extends keyof T,
  K extends Extract<keyof T, string>,
  F extends T[K] | undefined,
>(
  settings: SettingsManager<T, D>,
  key: K,
  fallback?: F,
): {
  value: K extends D
    ? NonNullable<T[K]>
    : F extends null | undefined
      ? T[K] | undefined
      : NonNullable<T[K]> | F;
  onChange: (newValue: ValType<T[K]>) => void;
} {
  const initial = settings.get(key, fallback);
  const [value, setValue] = React.useState(initial);

  return {
    value,
    onChange: (newValue: ValType<T[K]>) => {
      const isObj = newValue && typeof newValue === "object";
      const value = isObj && "value" in newValue ? newValue.value : newValue;
      const checked = isObj && "checked" in newValue ? newValue.checked : undefined;
      const target =
        isObj && "target" in newValue && newValue.target && typeof newValue.target === "object"
          ? newValue.target
          : undefined;
      const targetValue = target && "value" in target ? target.value : undefined;
      const targetChecked = target && "checked" in target ? target.checked : undefined;
      const finalValue = (checked ?? targetChecked ?? targetValue ?? value ?? newValue) as T[K];

      // @ts-expect-error ts doesn't understand
      setValue(finalValue);
      settings.set(key, finalValue);
    },
  };
}
export function useSettingArray<
  T extends Record<string, Jsonifiable>,
  D extends keyof T,
  K extends Extract<keyof T, string>,
  F extends T[K] | undefined,
>(
  settings: SettingsManager<T, D>,
  key: K,
  fallback?: F,
): [
  K extends D
    ? NonNullable<T[K]>
    : F extends null | undefined
      ? T[K] | undefined
      : NonNullable<T[K]> | F,
  (newValue: ValType<T[K]>) => void,
] {
  const { value, onChange } = useSetting(settings, key, fallback);

  return [value, onChange];
}

// Credit to @Vendicated - https://github.com/Vendicated/virtual-merge

type UnionToIntersection<U> = (U extends never ? never : (k: U) => void) extends (
  k: infer I,
) => void
  ? I & { all: () => I }
  : never;

type ObjectType = Record<never, never>;

type ExtractObjectType<O extends ObjectType[]> =
  O extends Array<infer T> ? UnionToIntersection<T> : never;

export function virtualMerge<O extends ObjectType[]>(...objects: O): ExtractObjectType<O> {
  const fallback = {};

  function findObjectByProp(prop: PropertyKey): ObjectType {
    for (const object of objects) {
      if (prop in object) return object;
    }
    return fallback;
  }

  const handler: ProxyHandler<ExtractObjectType<O>> = {
    ownKeys() {
      return objects.map((obj) => Reflect.ownKeys(obj)).flat();
    },
  };

  for (const method of [
    "defineProperty",
    "deleteProperty",
    "get",
    "getOwnPropertyDescriptor",
    "has",
    "set",
  ] as const) {
    handler[method] = function (_: unknown, ...args: unknown[]) {
      if (method === "get" && args[0] === "all") {
        // Return function that returns all objects combined
        // For use in devtools to see everything available
        return () =>
          objects.reduce((acc: Record<string, unknown>, obj: Record<string, unknown>) => {
            // Manually iterate over the property names of the object because the spread operator does not work with prototype objects, which are common for stores.
            Object.getOwnPropertyNames(obj).forEach((key) => {
              // Filter out keys that are common on all stores
              if (!(obj instanceof flux.Store) || (key !== "initialize" && key !== "constructor")) {
                acc[key] = obj[key];
              }
            });
            return acc;
          }, {});
      }
      return Reflect[method](
        findObjectByProp(args[0] as PropertyKey),
        // @ts-expect-error It's ok that it's not a tuple
        ...args,
      )!;
    };
  }
  return new Proxy(fallback, handler) as ExtractObjectType<O>;
}

export type Tree = Record<string, unknown> | null;
type TreeFilter = string | ((tree: Tree) => boolean);

/**
 * All credit goes to rauenzi for writing up this implementation.
 * You can find the original source here:
 * <https://github.com/rauenzi/BDPluginLibrary/blob/683d6abc70f149a39e2f0433ffb65e55ca47c4e3/release/0PluginLibrary.plugin.js#L2585C15-L2611>
 *
 * @remarks Used mainly in findInReactTree
 */
export function findInTree(
  tree: Tree,
  searchFilter: TreeFilter,
  args: { walkable?: string[]; ignore?: string[]; maxRecursion: number } = { maxRecursion: 100 },
): Tree | null | undefined {
  const { walkable, ignore, maxRecursion } = args;

  if (maxRecursion <= 0) return undefined;

  if (typeof searchFilter === "string") {
    if (Object.prototype.hasOwnProperty.call(tree, searchFilter))
      return tree?.[searchFilter] as Tree;
  } else if (searchFilter(tree)) {
    return tree;
  }

  if (typeof tree !== "object" || tree == null) return undefined;

  let tempReturn;
  if (Array.isArray(tree)) {
    for (const value of tree) {
      tempReturn = findInTree(value, searchFilter, {
        walkable,
        ignore,
        maxRecursion: maxRecursion - 1,
      });
      if (typeof tempReturn !== "undefined") return tempReturn;
    }
  } else {
    const toWalk = walkable == null ? Object.keys(tree) : walkable;
    for (const key of toWalk) {
      if (!Object.prototype.hasOwnProperty.call(tree, key) || ignore?.includes(key)) continue;
      tempReturn = findInTree(tree[key] as Tree, searchFilter, {
        walkable,
        ignore,
        maxRecursion: maxRecursion - 1,
      });
      if (typeof tempReturn !== "undefined") return tempReturn;
    }
  }
  return tempReturn;
}

/**
 * Find the component you are looking for in a tree, recursively.
 *
 * @param tree The tree to search through
 * @param searchFilter The filter. Either a string or a function. Should be unique
 * @param maxRecursion The max depth. Avoids call stack exceeded error.
 * @returns The component you are looking for
 */
export function findInReactTree(
  tree: Tree,
  searchFilter: TreeFilter,
  maxRecursion = 100,
): Tree | null | undefined {
  return findInTree(tree, searchFilter, {
    walkable: ["props", "children", "child", "sibling"],
    maxRecursion,
  });
}
