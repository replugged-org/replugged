import type { Jsonifiable } from "type-fest";

interface RPCData {
  args: Record<string, Jsonifiable | undefined>;
  cmd: string;
}

interface RPCCommand {
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
}

type Commands = Record<string, RPCCommand>;

class RpcAPI {
  #commandMap = new Map<string, RPCCommand>();
  /**
   * internal
   * @param name Command name
   * @returns Boolean
   */
  #checkName(name: string): void {
    if (!name.startsWith("REPLUGGED_"))
      throw new Error("RPC command name must start with REPLUGGED_");
  }

  /**
   * Function to Register RPC Commands
   * @param name Command name
   * @param command Command handler
   * @returns Unregister function
   */
  public registerRPCCommand(name: string, command: RPCCommand): () => void {
    this.#checkName(name);
    if (this.#commandMap.has(name)) throw new Error("RPC command already exists");
    this.#commandMap.set(name, command);
    return () => {
      this.#commandMap.delete(name);
    };
  }

  /**
   * Function to Unregister RPC Commands
   * @param name Command name
   */
  public unregisterRPCCommand(name: string): void {
    this.#checkName(name);
    this.#commandMap.delete(name);
  }

  /**
   * internal
   * @param commands Original Discord's commands object
   * @returns RPC Commands Proxy
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
        return {
          configurable: true,
          enumerable: true,
          writable: false,
          value: this.#commandMap.get(prop),
        };
      },
    });
  }
}

export default new RpcAPI();
