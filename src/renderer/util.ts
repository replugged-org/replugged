import { React, channels, fluxDispatcher, guilds } from "@common";
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
  document.head.appendChild(el);

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
 * @param invite Invite code (eg "replugged")
 */
export async function goToOrJoinServer(invite: string): Promise<void> {
  if (!getInvite || !resolveInvite || !transitionTo) {
    getInvite = getByProps<keyof GetInviteMod, GetInviteMod>("getInvite")?.getInvite;
    if (!getInvite) {
      throw new Error("Could not find getInvite");
    }

    resolveInvite = getByProps<keyof ResolveInviteMod, ResolveInviteMod>(
      "resolveInvite",
    )?.resolveInvite;
    if (!resolveInvite) {
      throw new Error("Could not find resolveInvite");
    }

    const transitionToMod = getBySource("Transitioning to");
    if (!transitionToMod) {
      throw new Error("Could not find transitionTo");
    }

    transitionTo = getFunctionBySource("Transitioning to", transitionToMod as ObjectExports);
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
  onChange: (newValue: T[K]) => void;
} {
  const initial = settings.get(key, fallback);
  const [value, setValue] = React.useState(initial);

  return {
    value,
    onChange: (newValue: T[K]) => {
      // @ts-expect-error It doesn't understand ig
      setValue(newValue);
      settings.set(key, newValue);
    },
  };
}
