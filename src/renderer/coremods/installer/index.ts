import { Injector, Logger } from "@replugged";
import { filters, getFunctionKeyBySource, waitForModule } from "src/renderer/modules/webpack";
import { ObjectExports } from "src/types";
import { InstallerSource, installFlow, isValidSource } from "./util";

const injector = new Injector();
const logger = Logger.coremod("Installer");

interface AnchorProps {
  href?: string;
  onClick?: () => void;
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

async function injectLinks(): Promise<void> {
  const linkMod = await waitForModule(filters.bySource(".useDefaultUnderlineStyles"), {
    raw: true,
  });
  const exports = linkMod.exports as ObjectExports & Record<string, React.FC<AnchorProps>>;

  const key = getFunctionKeyBySource(".useDefaultUnderlineStyles", exports);
  if (!key) {
    logger.error("Failed to find link component.");
    return;
  }

  injector.before(exports, key, ([args]) => {
    const { href } = args;
    if (!href) return;
    const installLink = parseInstallLink(href);
    if (!installLink) return;

    delete args.href;
    args.onClick = () => {
      void installFlow(installLink.identifier, installLink.source, installLink.id);
    };

    return [args] as [AnchorProps];
  });
}

export async function start(): Promise<void> {
  await injectLinks();
}

export function stop(): void {
  injector.uninjectAll();
}

export { installFlow };
