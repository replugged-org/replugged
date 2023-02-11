import { Injector, Logger } from "@replugged";
import { filters, getFunctionKeyBySource, waitForModule } from "src/renderer/modules/webpack";
import { ObjectExports } from "src/types";
import { Jsonifiable } from "type-fest";
import { InstallResponse, InstallerSource, installFlow, isValidSource } from "./util";

const injector = new Injector();
const logger = Logger.coremod("Installer");

interface AnchorProps {
  href?: string;
  onClick?: (e: Event) => void;
  className?: string;
  children?: React.ReactNode;
  rel?: string;
  target?: string;
  useDefaultUnderlineStyles?: boolean;
  title?: string;
  style?: React.CSSProperties;
  focusProps?: Record<string, unknown>;
}

interface InstallLinkProps {
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
    if (url.hostname !== "replugged.dev") return null;
    if (url.pathname !== "/install") return null;
    const params = url.searchParams;
    const identifier = params.get("identifier");
    const source = params.get("source") ?? undefined;
    const id = params.get("id") ?? undefined;
    if (!identifier) return null;
    if (source !== undefined && !isValidSource(source)) return null;
    return {
      identifier,
      source,
      id,
    };
  } catch {
    return null;
  }
}

let uninjectFns: Array<() => void> = [];

async function injectLinks(): Promise<void> {
  const linkMod = await waitForModule(filters.bySource(".useDefaultUnderlineStyles"), {
    raw: true,
  });
  const exports = linkMod.exports as ObjectExports & Record<string, React.FC<AnchorProps>>;

  const key = getFunctionKeyBySource(exports, ".useDefaultUnderlineStyles");
  if (!key) {
    logger.error("Failed to find link component.");
    return;
  }

  injector.before(exports, key, ([args]) => {
    const { href } = args;
    if (!href) return undefined;
    const installLink = parseInstallLink(href);
    if (!installLink) return undefined;

    args.onClick = (e) => {
      e.preventDefault();
      void installFlow(installLink.identifier, installLink.source, installLink.id);
    };

    return [args] as [AnchorProps];
  });
}

type Socket = Record<string, unknown> & {
  authorization: Record<string, unknown> & {
    scopes: string[];
  };
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RPCData = {
  args: Record<string, Jsonifiable>;
  cmd: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RPCCommand = {
  scope?:
    | string
    | {
        $any: string[];
      };
  handler: (
    data: RPCData,
  ) => Record<string, Jsonifiable> | Promise<Record<string, Jsonifiable>> | void | Promise<void>;
};

async function injectRpc(): Promise<void> {
  const rpcValidatorMod = await waitForModule<
    Record<string, (socket: Socket, client_id: string, origin: string) => Promise<void>>
  >(filters.bySource("Invalid Client ID"));
  const validatorFunctionKey = getFunctionKeyBySource(rpcValidatorMod, "Invalid Client ID");
  if (!validatorFunctionKey) {
    logger.error("Failed to find RPC validator function.");
    return;
  }

  injector.instead(rpcValidatorMod, validatorFunctionKey, (args, fn) => {
    const [, clientId, origin] = args;
    if (origin === "https://replugged.dev") {
      args[0].authorization.scopes = ["REPLUGGED"];
      return Promise.resolve();
    }
    if (clientId.startsWith("REPLUGGED-")) {
      throw new Error("Invalid Client ID");
    }

    return fn(...args);
  });

  const rpcMod = await waitForModule<{ commands: Record<string, RPCCommand> }>(
    filters.byProps("setCommandHandler"),
  );

  const modalFlows = new Map<string, Promise<InstallResponse>>();

  rpcMod.commands.REPLUGGED_INSTALL = {
    scope: "REPLUGGED",
    handler: async (data: RPCData) => {
      const { identifier, source, id } = data.args;
      if (typeof identifier !== "string") throw new Error("Invalid or missing identifier.");
      if (source !== undefined && typeof source !== "string") throw new Error("Invalid source.");
      if (id !== undefined && typeof id !== "string") throw new Error("Invalid id.");

      const cacheIdentifier = `${source}:${identifier}:${id ?? ""}`;
      if (modalFlows.has(cacheIdentifier)) {
        return await modalFlows.get(cacheIdentifier)!;
      }

      const res = installFlow(identifier, source as InstallerSource, id, false);

      modalFlows.set(cacheIdentifier, res);
      const ret = await res;
      modalFlows.delete(cacheIdentifier);
      return ret;
    },
  };

  uninjectFns.push(() => {
    delete rpcMod.commands.REPLUGGED_INSTALL;
  });
}

export async function start(): Promise<void> {
  await injectLinks();
  await injectRpc();
}

export function stop(): void {
  injector.uninjectAll();
  uninjectFns.forEach((fn) => fn());
}

export { installFlow };
