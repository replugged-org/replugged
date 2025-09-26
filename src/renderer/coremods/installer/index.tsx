import { parser } from "@common";
import { Injector } from "@replugged";
import type React from "react";
import type { Capture, DefaultInRule } from "simple-markdown";
import { plugins } from "src/renderer/managers/plugins";
import { generalSettings } from "src/renderer/managers/settings";
import { themes } from "src/renderer/managers/themes";
import { filters, getFunctionKeyBySource, waitForModule } from "src/renderer/modules/webpack";
import type { ObjectExports } from "src/types";
import rpc from "../../apis/rpc";
import AddonEmbed from "./AddonEmbed";
import { loadCommands } from "./commands";
import {
  type InstallLinkProps,
  type InstallResponse,
  type InstallerSource,
  installFlow,
  parseInstallLink,
} from "./util";

import type * as Design from "discord-client-types/discord_app/design/web";

const injector = new Injector();

const uninjectFns: Array<() => void> = [];

const modalFlows = new Map<string, Promise<InstallResponse>>();

const scopes = ["REPLUGGED"];
if (window.RepluggedNative.getVersion() === "dev") {
  scopes.push("REPLUGGED_LOCAL");
}

function injectRpc(): void {
  const uninjectInstall = rpc.registerRPCCommand("REPLUGGED_INSTALL", {
    scope: {
      $any: scopes,
    },
    handler: async (data) => {
      const { identifier, source, id } = data.args;
      if (typeof identifier !== "string") throw new Error("Invalid or missing identifier.");
      if (source !== undefined && typeof source !== "string") throw new Error("Invalid source.");
      if (id !== undefined && typeof id !== "string") throw new Error("Invalid id.");

      const cacheIdentifier = `${source}:${identifier}:${id ?? ""}`;
      if (modalFlows.has(cacheIdentifier)) {
        return await modalFlows.get(cacheIdentifier)!;
      }

      const res = installFlow(identifier, source as InstallerSource, id, false, false);

      modalFlows.set(cacheIdentifier, res);
      const ret = await res;
      modalFlows.delete(cacheIdentifier);
      return ret;
    },
  });

  const uninjectList = rpc.registerRPCCommand("REPLUGGED_LIST_ADDONS", {
    scope: {
      $any: scopes,
    },
    handler: () => {
      const pluginIds = [...plugins.keys()];
      const themeIds = [...themes.keys()];
      return {
        plugins: pluginIds,
        themes: themeIds,
      };
    },
  });

  uninjectFns.push(uninjectInstall, uninjectList);
}

const triggerInstall = (
  installLink: InstallLinkProps,
  e: React.MouseEvent<HTMLAnchorElement>,
): void => {
  // If control/cmd is pressed, do not trigger the install modal
  if (e.ctrlKey || e.metaKey) return;

  e.preventDefault();
  void installFlow(installLink.identifier, installLink.source, installLink.id, true, true);
};

async function injectLinks(): Promise<void> {
  const linkMod = await waitForModule(filters.bySource(",useDefaultUnderlineStyles:"), {
    raw: true,
  });
  const exports = linkMod.exports as ObjectExports & {
    Anchor: Design.Anchor;
  };
  const anchorKey = getFunctionKeyBySource(exports, "")! as "Anchor"; // It's actually a mangled name, but TS can sit down and shut up
  injector.before(exports, anchorKey, (args) => {
    const { href } = args[0];
    if (!href) return args;
    const installLink = parseInstallLink(href);
    if (!installLink) return args;

    args[0].onClick = (e) => triggerInstall(installLink, e);

    return args;
  });

  const defaultRules = parser.defaultRules as typeof parser.defaultRules & {
    repluggedInstallLink?: DefaultInRule;
  };

  defaultRules.repluggedInstallLink = {
    order: defaultRules.autolink.order - 0.5,
    match: (source: string) => {
      const match = /^<?(https?:\/\/[^\s<]+[^<>.,:; "'\]\s])>?/.exec(source);
      if (!match) return null;
      const installLink = parseInstallLink(match[1]);
      if (!installLink) return null;
      if (installLink.source !== "store") return null;
      if (!generalSettings.get("addonEmbeds")) return null;
      return match;
    },
    parse: (capture: Capture) => {
      const installLink = parseInstallLink(capture[1]);
      return {
        ...installLink,
        url: capture[1],
      };
    },
    react: (node) => {
      const { url, ...installLink } = node as unknown as InstallLinkProps & { url: string };
      const fallback = (
        <a
          href={url}
          onClick={(e) => triggerInstall(installLink, e)}
          target="_blank"
          rel="noopener noreferrer">
          {url}
        </a>
      );

      return <AddonEmbed key={installLink.identifier} addon={installLink} fallback={fallback} />;
    },
    // @ts-expect-error type is wrong
    requiredFirstCharacters: ["<", "h"],
  };

  parser.parse = parser.reactParserFor(defaultRules);

  uninjectFns.push(() => {
    delete defaultRules.repluggedInstallLink;
    parser.parse = parser.reactParserFor(defaultRules);
  });
}

export async function start(): Promise<void> {
  await injectLinks();
  injectRpc();
  loadCommands(injector);
}

export function stop(): void {
  injector.uninjectAll();
  uninjectFns.forEach((fn) => fn());
}

export { installFlow };
