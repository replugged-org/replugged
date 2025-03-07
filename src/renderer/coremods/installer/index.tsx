import { parser } from "@common";
import { Injector } from "@recelled";
import type { Capture, DefaultInRule } from "simple-markdown";
import { plugins } from "src/renderer/managers/plugins";
import { themes } from "src/renderer/managers/themes";
import { filters, getFunctionKeyBySource, waitForModule } from "src/renderer/modules/webpack";
import { ObjectExports } from "src/types";
import { registerRPCCommand } from "../rpc";
import { generalSettings } from "../settings/pages";
import AddonEmbed from "./AddonEmbed";
import { loadCommands } from "./commands";
import {
  InstallLinkProps,
  InstallResponse,
  InstallerSource,
  installFlow,
  parseInstallLink,
} from "./util";

const injector = new Injector();

interface AnchorProps extends React.ComponentPropsWithoutRef<"a"> {
  useDefaultUnderlineStyles?: boolean;
  focusProps?: Record<string, unknown>;
}

let uninjectFns: Array<() => void> = [];

const modalFlows = new Map<string, Promise<InstallResponse>>();

const scopes = ["REPLUGGED", "RECELLED"];
if (window.ReCelledNative.getVersion() === "dev") {
  scopes.push("RECELLED_LOCAL");
  scopes.push("REPLUGGED_LOCAL");
}

function injectRpc(): void {
  const uninjectInstall = registerRPCCommand("REPLUGGED_INSTALL", {
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

  const uninjectList = registerRPCCommand("REPLUGGED_LIST_ADDONS", {
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
    Anchor: React.FC<React.PropsWithChildren<AnchorProps>>;
  };
  const anchorKey = getFunctionKeyBySource(exports, "")! as "Anchor"; // It's actually a mangled name, but TS can sit down and shut up
  injector.instead(exports, anchorKey, (args, fn) => {
    const { href } = args[0];
    if (!href) return fn(...args);
    const installLink = parseInstallLink(href);
    if (!installLink) return fn(...args);

    args[0].onClick = (e) => triggerInstall(installLink, e);

    return fn(...args);
  });

  const defaultRules = parser.defaultRules as typeof parser.defaultRules & {
    repluggedInstallLink?: DefaultInRule;
  };

  defaultRules.repluggedInstallLink = {
    order: defaultRules.autolink.order - 0.5,
    match: (source: string) => {
      const match = source.match(/^<?(https?:\/\/[^\s<]+[^<>.,:; "'\]\s])>?/);
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
