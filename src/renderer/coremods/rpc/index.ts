/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Injector, Logger } from "@replugged";
import { filters, getFunctionKeyBySource, waitForModule } from "@webpack";
import { Jsonifiable } from "type-fest";

const injector = new Injector();

const logger = Logger.coremod("RPC");

type Socket = Record<string, unknown> & {
  authorization: Record<string, unknown> & {
    scopes: string[];
  };
};

type RPCData = {
  args: Record<string, Jsonifiable>;
  cmd: string;
};

type RPCCommand = {
  scope?:
    | string
    | {
        $any: string[];
      };
  handler: (
    data: RPCData,
  ) =>
    | Record<string, Jsonifiable | undefined>
    | Promise<Record<string, Jsonifiable | undefined>>
    | void
    | Promise<void>;
};

type Commands = Record<string, RPCCommand>;

type RPCMod = { commands: Commands };

let commands: Commands = {};

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
    const isRepluggedClient = clientId.startsWith("REPLUGGED-");

    // From Replugged site
    if (origin === "https://replugged.dev") {
      args[0].authorization.scopes = ["REPLUGGED"];
      return Promise.resolve();
    }

    // From localhost but for Replugged
    if (!origin && isRepluggedClient) {
      args[0].authorization.scopes = ["REPLUGGED_LOCAL"];
      return Promise.resolve();
    }

    // For Replugged but not from an allowed origin
    if (isRepluggedClient) {
      throw new Error("Invalid Client ID");
    }

    return fn(...args);
  });

  const rpcMod = await waitForModule<RPCMod>(filters.byProps("setCommandHandler"));

  // Apply any existing commands to the RPC module
  rpcMod.commands = {
    ...rpcMod.commands,
    ...commands,
  };

  // Set the commands to the real commands object
  commands = rpcMod.commands;
}

/**
 * @param name Command name
 * @param command Command handler
 * @returns Unregister function
 */
export function registerRPCCommand(name: string, command: RPCCommand): () => void {
  if (!name.startsWith("REPLUGGED_"))
    throw new Error("RPC command name must start with REPLUGGED_");
  if (name in commands) throw new Error("RPC command already exists");
  commands[name] = command;
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete commands[name];
  };
}

/**
 * @param name Command name
 */
export function unregisterRPCCommand(name: string): void {
  if (!name.startsWith("REPLUGGED_"))
    throw new Error("RPC command name must start with REPLUGGED_");
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete commands[name];
}

export async function start(): Promise<void> {
  await injectRpc();
}
export function stop(): void {
  injector.uninjectAll();
}
