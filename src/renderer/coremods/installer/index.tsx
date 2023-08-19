import { Injector, Logger } from "@replugged";
import { filters, getFunctionKeyBySource, waitForModule } from "src/renderer/modules/webpack";
import { ObjectExports } from "src/types";
import { registerRPCCommand } from "../rpc";
import { InstallResponse, InstallerSource, installFlow, isValidSource } from "./util";
import { plugins } from "src/renderer/managers/plugins";
import { themes } from "src/renderer/managers/themes";
import AddonEmbed from "./AddonEmbed";
import { generalSettings } from "../settings/pages";
import type { Capture, DefaultInRule } from "simple-markdown";
import { parser } from "@common";

const injector = new Injector();
const logger = Logger.coremod("Installer");

interface AnchorProps extends React.ComponentPropsWithoutRef<"a"> {
  useDefaultUnderlineStyles?: boolean;
  focusProps?: Record<string, unknown>;
}

export interface InstallLinkProps {
  /** Identifier for the addon in the source */
  identifier: string;
  /** Updater source type */
  source?: InstallerSource;
  /** ID for the addon in that source. Useful for GitHub repositories that have multiple addons. */
  id?: string;
}

function parseInstallLink(href: string): InstallLinkProps | null {
  try {
    const url = new URL(href);
    const repluggedHostname = new URL(generalSettings.get("apiUrl")).hostname;
    if (url.hostname !== repluggedHostname) return null;

    if (url.pathname === "/install") {
      const params = url.searchParams;
      const identifier = params.get("identifier");
      const source = params.get("source") ?? "store";
      const id = params.get("id") ?? undefined;
      if (!identifier) return null;
      if (!isValidSource(source)) return null;
      return {
        identifier,
        source,
        id,
      };
    }

    const storeMatch = url.pathname.match(/^\/store\/([^/]+)$/);
    if (storeMatch) {
      const identifier = storeMatch[1];
      if (["plugins", "themes"].includes(identifier.toLowerCase())) return null;
      return {
        identifier,
        source: "store",
      };
    }

    return null;
  } catch {
    return null;
  }
}

let uninjectFns: Array<() => void> = [];

const modalFlows = new Map<string, Promise<InstallResponse>>();

const scopes = ["REPLUGGED"];
if (window.RepluggedNative.getVersion() === "dev") {
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
  const linkMod = await waitForModule(filters.bySource(".useDefaultUnderlineStyles"), {
    raw: true,
  });
  const exports = linkMod.exports as ObjectExports &
    Record<string, React.FC<React.PropsWithChildren<AnchorProps>>>;

  const key = getFunctionKeyBySource(exports, ".useDefaultUnderlineStyles");
  if (!key) {
    logger.error("Failed to find link component.");
    return;
  }

  injector.instead(exports, key, (args, fn) => {
    const { href } = args[0];
    if (!href) return fn(...args);
    const installLink = parseInstallLink(href);
    if (!installLink) return fn(...args);

    args[0].onClick = (e) => triggerInstall(installLink, e);

    const res = fn(...args);

    return res;
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
      if (!generalSettings.get("addonEmbeds")) return null;
      return match;
    },
    parse: (capture: Capture) => {
      const installLink = parseInstallLink(capture[1]);
      return {
        ...installLink!,
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
}

export function stop(): void {
  injector.uninjectAll();
  uninjectFns.forEach((fn) => fn());
}

export { installFlow };
