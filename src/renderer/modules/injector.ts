import type { RepluggedCommand } from "../../types/coremods/commands";
import type { ContextMenuTypes, GetContextItem } from "../../types/coremods/contextMenu";
import type { GetButtonItem } from "../../types/coremods/message";
import type { CommandOptions } from "../../types/discord";
import type { AnyFunction } from "../../types/util";
import type { ObjectExports } from "../../types/webpack";
import { CommandManager } from "../apis/commands";
import { type ContextMenuProps, addContextMenuItem } from "../coremods/contextMenu";
import { addButton } from "../coremods/messagePopover";

enum InjectionTypes {
  Before,
  BeforeAsync,
  Instead,
  InsteadAsync,
  After,
  AfterAsync,
}

/**
 * Code to run before the original function
 * @param args Arguments passed to the original function
 * @param self The module the injected function is on
 * @returns New arguments to pass to the original function, or undefined to leave them unchanged
 */
export type BeforeCallback<A extends unknown[] = unknown[]> = (
  args: A,
  self: ObjectExports,
) => A | undefined | void;

/**
 * Code to run before the original function asynchronously
 * @param args Arguments passed to the original function
 * @param self The module the injected function is on
 * @returns New arguments to pass to the original function, or undefined to leave them unchanged
 */
export type BeforeCallbackAsync<A extends unknown[] = unknown[]> = (
  args: A,
  self: ObjectExports,
) => Promise<A | undefined | void>;

/**
 * Code to run instead of the original function
 * @param args Arguments passed to the original function
 * @param orig The original function
 * @param self The module the injected function is on
 * @returns New result to return
 */
export type InsteadCallback<A extends unknown[] = unknown[], R = unknown> = (
  args: A,
  orig: (...args: A) => R,
  self: ObjectExports,
) => R | void;

/**
 * Code to run instead of the original function asynchronously
 * @param args Arguments passed to the original function
 * @param orig The original function
 * @param self The module the injected function is on
 * @returns New result to return
 */
export type InsteadCallbackAsync<A extends unknown[] = unknown[], R = unknown> = (
  args: A,
  orig: (...args: A) => R,
  self: ObjectExports,
) => R | void;

/**
 * Code to run after the original function
 * @param args Arguments passed to the original function
 * @param res Result of the original function
 * @param self The module the injected function is on
 * @returns New result to return, or undefined to leave it unchanged
 */
export type AfterCallback<A extends unknown[] = unknown[], R = unknown> = (
  args: A,
  res: R,
  self: ObjectExports,
) => R | undefined | void;

/**
 * Code to run after the original function asynchronously
 * @param args Arguments passed to the original function
 * @param res Result of the original function
 * @param self The module the injected function is on
 * @returns New result to return, or undefined to leave it unchanged
 */
export type AfterCallbackAsync<A extends unknown[] = unknown[], R = unknown> = (
  args: A,
  res: R,
  self: ObjectExports,
) => Promise<R | undefined | void>;

interface ObjectInjections {
  injections: Map<
    string,
    {
      before: Set<BeforeCallback>;
      instead: Set<InsteadCallback>;
      after: Set<AfterCallback>;
    }
  >;
  original: Map<string, AnyFunction>;
}

interface ObjectInjectionsAsync {
  injections: Map<
    string,
    {
      before: Set<BeforeCallbackAsync>;
      instead: Set<InsteadCallbackAsync>;
      after: Set<AfterCallbackAsync>;
    }
  >;
  original: Map<string, AnyFunction>;
}

const injections = new WeakMap<ObjectExports, ObjectInjections>();

const injectionsAsync = new WeakMap<ObjectExports, ObjectInjectionsAsync>();

function replaceMethod<T extends Record<U, AnyFunction>, U extends keyof T & string>(
  obj: T,
  funcName: U,
): void {
  if (typeof obj[funcName] !== "function") {
    throw new TypeError(`Value of '${funcName}' in object is not a function`);
  }

  let objInjections: ObjectInjections;
  if (injections.has(obj)) {
    objInjections = injections.get(obj)!;
  } else {
    objInjections = {
      injections: new Map(),
      original: new Map(),
    };
    injections.set(obj, objInjections);
  }

  if (!objInjections.injections.has(funcName)) {
    objInjections.injections.set(funcName, {
      before: new Set(),
      instead: new Set(),
      after: new Set(),
    });
  }

  if (!objInjections.original.has(funcName)) {
    objInjections.original.set(funcName, obj[funcName]);

    const originalFunc = obj[funcName];

    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/48992
    obj[funcName] = function (...args: unknown[]): unknown {
      const injectionsForProp = objInjections.injections.get(funcName)!;

      for (const b of injectionsForProp.before) {
        const newArgs = b.call(this, args, this);
        if (Array.isArray(newArgs)) {
          args = newArgs;
        }
      }

      let res: unknown;

      if (injectionsForProp.instead.size === 0) {
        res = originalFunc.apply(this, args);
      } else {
        for (const i of injectionsForProp.instead) {
          const newResult = i.call(this, args, originalFunc, this);
          if (newResult !== void 0) {
            res = newResult;
          }
        }
      }

      for (const a of injectionsForProp.after) {
        const newResult = a.call(this, args, res, this);
        if (newResult !== void 0) {
          res = newResult;
        }
      }

      return res;
    };

    Object.defineProperties(obj[funcName], Object.getOwnPropertyDescriptors(originalFunc));
    obj[funcName].toString = originalFunc.toString.bind(originalFunc);
  }
}

function replaceMethodAsync<T extends Record<U, AnyFunction>, U extends keyof T & string>(
  obj: T,
  funcName: U,
): void {
  if (typeof obj[funcName] !== "function") {
    throw new TypeError(`Value of '${funcName}' in object is not a function`);
  }

  let objInjections: ObjectInjectionsAsync;
  if (injectionsAsync.has(obj)) {
    objInjections = injectionsAsync.get(obj)!;
  } else {
    objInjections = {
      injections: new Map(),
      original: new Map(),
    };
    injectionsAsync.set(obj, objInjections);
  }

  if (!objInjections.injections.has(funcName)) {
    objInjections.injections.set(funcName, {
      before: new Set(),
      instead: new Set(),
      after: new Set(),
    });
  }

  if (!objInjections.original.has(funcName)) {
    objInjections.original.set(funcName, obj[funcName]);

    const originalFunc = obj[funcName];

    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/48992
    obj[funcName] = async function (...args: unknown[]): unknown {
      const injectionsForProp = objInjections.injections.get(funcName)!;

      for (const b of injectionsForProp.before) {
        const newArgs = await b.call(this, args, this);
        if (Array.isArray(newArgs)) {
          args = newArgs;
        }
      }

      let res: unknown;

      if (injectionsForProp.instead.size === 0) {
        res = await originalFunc.apply(this, args);
      } else {
        for (const i of injectionsForProp.instead) {
          const newResult = await i.call(this, args, originalFunc, this);
          if (newResult !== void 0) {
            res = newResult;
          }
        }
      }

      for (const a of injectionsForProp.after) {
        const newResult = await a.call(this, args, res, this);
        if (newResult !== void 0) {
          res = newResult;
        }
      }

      return res;
    };

    Object.defineProperties(obj[funcName], Object.getOwnPropertyDescriptors(originalFunc));
    obj[funcName].toString = originalFunc.toString.bind(originalFunc);
  }
}

function inject<T extends Record<U, AnyFunction>, U extends keyof T & string>(
  obj: T,
  funcName: U,
  cb: BeforeCallback | InsteadCallback | AfterCallback,
  type: InjectionTypes,
): () => void {
  replaceMethod(obj, funcName);
  const methodInjections = injections.get(obj)!.injections.get(funcName)!;
  let set: Set<BeforeCallback | InsteadCallback | AfterCallback>;
  switch (type) {
    case InjectionTypes.Before:
      set = methodInjections.before;
      break;
    case InjectionTypes.Instead:
      set = methodInjections.instead;
      break;
    case InjectionTypes.After:
      set = methodInjections.after;
      break;
    default:
      throw new Error(`Invalid injection type: ${type}`);
  }
  set.add(cb);
  const setRef = new WeakRef(set);
  return () => void setRef.deref()?.delete(cb);
}

function injectAsync<T extends Record<U, AnyFunction>, U extends keyof T & string>(
  obj: T,
  funcName: U,
  cb: BeforeCallbackAsync | InsteadCallbackAsync | AfterCallbackAsync,
  type: InjectionTypes,
): () => void {
  replaceMethodAsync(obj, funcName);
  const methodInjections = injectionsAsync.get(obj)!.injections.get(funcName)!;
  let set: Set<BeforeCallbackAsync | InsteadCallbackAsync | AfterCallbackAsync>;
  switch (type) {
    case InjectionTypes.BeforeAsync:
      set = methodInjections.before;
      break;
    case InjectionTypes.InsteadAsync:
      set = methodInjections.instead;
      break;
    case InjectionTypes.AfterAsync:
      set = methodInjections.after;
      break;
    default:
      throw new Error(`Invalid injection type: ${type}`);
  }
  set.add(cb);
  const setRef = new WeakRef(set);
  return () => void setRef.deref()?.delete(cb);
}

function before<
  T extends Record<U, AnyFunction>,
  U extends keyof T & string,
  A extends unknown[] = Parameters<T[U]>,
>(obj: T, funcName: U, cb: BeforeCallback<A>): () => void {
  // @ts-expect-error 'unknown[]' is assignable to the constraint of type 'A', but 'A' could be instantiated with a different subtype of constraint 'unknown[]'.
  return inject(obj, funcName, cb as BeforeCallback, InjectionTypes.Before);
}

function beforeAsync<
  T extends Record<U, AnyFunction>,
  U extends keyof T & string,
  A extends unknown[] = Parameters<T[U]>,
>(obj: T, funcName: U, cb: BeforeCallbackAsync<A>): () => void {
  // @ts-expect-error 'unknown[]' is assignable to the constraint of type 'A', but 'A' could be instantiated with a different subtype of constraint 'unknown[]'.
  return injectAsync(obj, funcName, cb as BeforeCallbackAsync, InjectionTypes.BeforeAsync);
}

function instead<
  T extends Record<U, AnyFunction>,
  U extends keyof T & string,
  A extends unknown[] = Parameters<T[U]>,
  R = ReturnType<T[U]>,
>(obj: T, funcName: U, cb: InsteadCallback<A, R>): () => void {
  // @ts-expect-error 'unknown[]' is assignable to the constraint of type 'A', but 'A' could be instantiated with a different subtype of constraint 'unknown[]'.
  return inject(obj, funcName, cb, InjectionTypes.Instead);
}

function insteadAsync<
  T extends Record<U, AnyFunction>,
  U extends keyof T & string,
  A extends unknown[] = Parameters<T[U]>,
  R = ReturnType<T[U]>,
>(obj: T, funcName: U, cb: InsteadCallbackAsync<A, R>): () => void {
  // @ts-expect-error 'unknown[]' is assignable to the constraint of type 'A', but 'A' could be instantiated with a different subtype of constraint 'unknown[]'.
  return inject(obj, funcName, cb, InjectionTypes.InsteadAsync);
}

function after<
  T extends Record<U, AnyFunction>,
  U extends keyof T & string,
  A extends unknown[] = Parameters<T[U]>,
  R = ReturnType<T[U]>,
>(obj: T, funcName: U, cb: AfterCallback<A, R>): () => void {
  // @ts-expect-error 'unknown[]' is assignable to the constraint of type 'A', but 'A' could be instantiated with a different subtype of constraint 'unknown[]'.
  return inject(obj, funcName, cb, InjectionTypes.After);
}

function afterAsync<
  T extends Record<U, AnyFunction>,
  U extends keyof T & string,
  A extends unknown[] = Parameters<T[U]>,
  R = ReturnType<T[U]>,
>(obj: T, funcName: U, cb: AfterCallbackAsync<A, R>): () => void {
  // @ts-expect-error 'unknown[]' is assignable to the constraint of type 'A', but 'A' could be instantiated with a different subtype of constraint 'unknown[]'.
  return inject(obj, funcName, cb, InjectionTypes.AfterAsync);
}

/**
 * Inject code into Discord's webpack modules.
 *
 * @example
 * ```
 * import { Injector, webpack } from "replugged";
 *
 * const injector = new Injector();
 *
 * export async function start() {
 *   const typingMod = (await webpack.waitForModule<{
 *     startTyping: (channelId: string) => void;
 *   }>(
 *     webpack.filters.byProps("startTyping")
 *   ));
 *
 *   injector.after(typingMod, "startTyping", ([channel]) => {
 *     console.log(`Typing in channel ID ${channel}`);
 *   });
 * }
 *
 * export function stop() {
 *   injector.uninjectAll();
 * }
 * ```
 */
export class Injector {
  #uninjectors = new Set<() => void>();
  #slashCommandManager = new CommandManager();
  /**
   * Run code before a native module
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public before<
    T extends Record<U, AnyFunction>,
    U extends keyof T & string,
    A extends unknown[] = Parameters<T[U]>,
  >(obj: T, funcName: U, cb: BeforeCallback<A>): () => void {
    const uninjector = before(obj, funcName, cb);
    this.#uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Run code before a native module asynchronously
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public beforeAsync<
    T extends Record<U, AnyFunction>,
    U extends keyof T & string,
    A extends unknown[] = Parameters<T[U]>,
  >(obj: T, funcName: U, cb: BeforeCallbackAsync<A>): () => void {
    const uninjector = beforeAsync(obj, funcName, cb);
    this.#uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Run code instead of a native module
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public instead<
    T extends Record<U, AnyFunction>,
    U extends keyof T & string,
    A extends unknown[] = Parameters<T[U]>,
    R = ReturnType<T[U]>,
  >(obj: T, funcName: U, cb: InsteadCallback<A, R>): () => void {
    const uninjector = instead(obj, funcName, cb);
    this.#uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Run code instead of a native module asynchronously
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public insteadAsync<
    T extends Record<U, AnyFunction>,
    U extends keyof T & string,
    A extends unknown[] = Parameters<T[U]>,
    R = ReturnType<T[U]>,
  >(obj: T, funcName: U, cb: InsteadCallbackAsync<A, R>): () => void {
    const uninjector = insteadAsync(obj, funcName, cb);
    this.#uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Run code after a native module
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public after<
    T extends Record<U, AnyFunction>,
    U extends keyof T & string,
    A extends unknown[] = Parameters<T[U]>,
    R = ReturnType<T[U]>,
  >(obj: T, funcName: U, cb: AfterCallback<A, R>): () => void {
    const uninjector = after(obj, funcName, cb);
    this.#uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * Run code after a native module asynchronously
   * @param obj Module to inject to
   * @param funcName Function name on that module to inject
   * @param cb Code to run
   * @returns Uninject function
   */
  public afterAsync<
    T extends Record<U, AnyFunction>,
    U extends keyof T & string,
    A extends unknown[] = Parameters<T[U]>,
    R = ReturnType<T[U]>,
  >(obj: T, funcName: U, cb: AfterCallbackAsync<A, R>): () => void {
    const uninjector = afterAsync(obj, funcName, cb);
    this.#uninjectors.add(uninjector);
    return uninjector;
  }

  /**
   * A few utils to add stuff in frequent modules.
   */
  public utils = {
    /**
     * A utility function to add a button to any message popover.
     * @param item The function that creates the button to add
     * @returns Uninject Function.
     *
     * @example
     * ```
     * import { Injector, webpack } from "replugged";
     *
     * const injector = new Injector();
     *
     * export function start() {
     *   injector.utils.addPopoverButton((msg: Message, channel: Channel) => {
     *     return {
     *       label: "Click the button!",
     *       icon: myVeryCoolIcon(), // Cool icon
     *       onClick: () => {
     *         // do stuff here when someone left clicks the button
     *       },
     *       onContextMenu: () => {
     *         // do other stuff here when someone right clicks the button
     *       },
     *     };
     *   });
     * }
     *
     * export function stop() {
     *   injector.uninjectAll();
     * }
     * ```
     */
    addPopoverButton: (item: GetButtonItem) => {
      const uninjector = addButton(item);
      this.#uninjectors.add(uninjector);
      return uninjector;
    },

    /**
     * A utility function to add an item to any context menu.
     * By default, items are placed in a group for custom items, though that can be customized with `sectionId` and `indexInSection`
     * @param navId The id of the menu to add to
     * @param item The function that creates the item to add
     * @param sectionId — The number of the section to add to. Defaults to Replugged's section
     * @param indexInSection — The index in the section to add to. Defaults to the end position
     * @returns A callback to de-register the function
     *
     * @example
     * ```
     * import { Injector, components, types } from "replugged";
     * const { ContextMenu: { MenuItem } } = components;
     * const { ContextMenuTypes } = types;
     *
     * const injector = new Injector();
     *
     * export function start() {
     *   injector.utils.addMenuItem(ContextMenuTypes.UserContext, // Right-clicking a user
     *     (data, menu) => {
     *       return <MenuItem
     *         id="my-item"
     *         label="An Item!"
     *         action={() => console.log(data)}
     *       />
     *     }
     *   )
     * }
     *
     * export function stop() {
     *   injector.uninjectAll();
     * }
     * ```
     */
    addMenuItem: <T extends Record<string, unknown> = Record<string, unknown>>(
      navId: ContextMenuTypes,
      item: GetContextItem<T>,
      sectionId: number | ((props: ContextMenuProps) => number) | undefined = undefined,
      indexInSection: number | ((props: ContextMenuProps) => number) = Infinity, // Last item
    ) => {
      const uninjector = addContextMenuItem(
        navId,
        item as GetContextItem,
        sectionId,
        indexInSection,
      );
      this.#uninjectors.add(uninjector);
      return uninjector;
    },

    /**
     * A utility function to add a custom slash command.
     * @param cmd The slash command to add to register
     * @returns A callback to de-register the command
     *
     * @example
     * ```
     * import { Injector, types } from "replugged";
     *
     * const injector = new Injector();
     *
     * export function start() {
     *   injector.utils.registerSlashCommand({
     *        name: "use",
     *        description: "a command meant to be used",
     *        usage: "/use",
     *        executor: (interaction) => {},
     *    })
     * }
     *
     * export function stop() {
     *   injector.uninjectAll();
     * }
     * ```
     */
    registerSlashCommand: <const T extends CommandOptions>(cmd: RepluggedCommand<T>) => {
      const uninjector = this.#slashCommandManager.registerCommand<T>(cmd);
      this.#uninjectors.add(uninjector);
      return uninjector;
    },
  };

  /**
   * Remove all injections made by this injector
   */
  public uninjectAll(): void {
    for (const uninjector of this.#uninjectors) {
      if (typeof uninjector === "function") {
        uninjector();
        this.#uninjectors.delete(uninjector);
      }
    }
  }
}
