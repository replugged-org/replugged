import type { Jsonifiable } from "type-fest";

interface RPCData {
  args: Record<string, Jsonifiable | undefined>;
  cmd: string;
}

interface RPCCommand {
  scope?: string | { $any: string[] };
  handler: (
    data: RPCData,
  ) =>
    | Record<string, Jsonifiable | undefined>
    | Promise<Record<string, Jsonifiable | undefined>>
    | void
    | Promise<void>;
}

type Commands = Record<string, RPCCommand>;

class RpcAPI {
  #commandMap = new Map<string, RPCCommand>();

  #checkName(name: string): void {
    if (!name.startsWith("REPLUGGED_"))
      throw new Error("RPC command name must start with REPLUGGED_");
  }

  /**
   * Register an RPC command.
   * @param name The command name.
   * @param command The command definition.
   * @returns Unregister function.
   */
  public registerRPCCommand(name: string, command: RPCCommand): () => void {
    this.#checkName(name);
    if (this.#commandMap.has(name)) throw new Error("RPC command already exists");
    this.#commandMap.set(name, command);
    return () => this.#commandMap.delete(name);
  }

  /**
   * Unregister an RPC command.
   * @param name The command name.
   */
  public unregisterRPCCommand(name: string): void {
    this.#checkName(name);
    this.#commandMap.delete(name);
  }

  /**
   * Wrap Discord's commands object with Replugged RPC commands.
   * @param commands The original commands object.
   * @returns The wrapped commands object.
   * @internal
   */
  public _getCommands(commands: Commands): Commands {
    return new Proxy(commands, {
      get: (target, prop: string) => {
        if (prop in target) {
          return Reflect.get(target, prop);
        }
        return this.#commandMap.get(prop);
      },
      set: (target, prop, value) => {
        return Reflect.set(target, prop, value);
      },
      deleteProperty: (target, prop) => {
        return Reflect.deleteProperty(target, prop);
      },
      ownKeys: (target) => {
        return [...Reflect.ownKeys(target), ...this.#commandMap.keys()];
      },
      getOwnPropertyDescriptor: (target, prop: string) => {
        if (prop in target) {
          return Object.getOwnPropertyDescriptor(target, prop);
        }
        if (this.#commandMap.has(prop)) {
          return {
            configurable: true,
            enumerable: true,
            writable: false,
            value: this.#commandMap.get(prop),
          };
        }
      },
    });
  }
}

export default new RpcAPI();
