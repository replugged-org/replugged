import { Injector } from "@replugged";
import { BETA_WEBSITE_URL, WEBSITE_URL } from "src/constants";
import { filters, getFunctionKeyBySource, waitForModule } from "src/renderer/modules/webpack";

const injector = new Injector();

type Socket = Record<string, unknown> & {
  authorization: Record<string, unknown> & {
    scopes: string[];
  };
};

export async function start(): Promise<void> {
  const rpcValidatorMod = await waitForModule<
    Record<string, (socket: Socket, client_id: string, origin: string) => Promise<void>>
  >(filters.bySource("Invalid Client ID"));
  const fetchApplicationsRPCKey = getFunctionKeyBySource(rpcValidatorMod, "Invalid Origin")!;

  injector.instead(rpcValidatorMod, fetchApplicationsRPCKey, (args, fn) => {
    const [{ authorization }, clientId, origin] = args;
    const isRepluggedClient = clientId.startsWith("REPLUGGED-");

    // From Replugged site
    if (origin === WEBSITE_URL || origin === BETA_WEBSITE_URL) {
      authorization.scopes = ["REPLUGGED"];
      return Promise.resolve();
    }

    // From localhost but for Replugged
    if (isRepluggedClient && (!origin || new URL(origin).hostname === "localhost")) {
      authorization.scopes = ["REPLUGGED_LOCAL"];
      return Promise.resolve();
    }

    // For Replugged but not from an allowed origin
    if (isRepluggedClient) {
      throw new Error("Invalid Client ID");
    }

    return fn(...args);
  });
}
export function stop(): void {
  injector.uninjectAll();
}
