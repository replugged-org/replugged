type SettingsUpdate<T> =
  | {
      type: "set";
      value: T[keyof T];
    }
  | {
      type: "delete";
    };

/**
 * Manages settings for a given namespace.
 *
 * This class should not be instantiated directly; use {@link init init()} for convenience and reliability.
 *
 * The {@link SettingsManager.load load()} method copies the namespaces' settings data from the file system into the manager.
 * All communication between a `SettingsManager` and the file system occurs asynchronously over IPC.
 *
 * Once the settings data has been copied into the `SettingsManager`, it can be read and written synchronously.
 * The `SettingsManager` automatically queues and dispatches updates to the file system in the background.
 */
export class SettingsManager<T extends Record<string, unknown>> {
  #settings: T | undefined;
  #saveTimeout: ReturnType<typeof setTimeout> | undefined;
  #queuedUpdates: Map<Extract<keyof T, string>, SettingsUpdate<T>>;

  /**
   * Namespace for these settings.
   */
  public namespace: string;

  /**
   * Creates a SettingsManager. This does not load any settings from storage; call the {@link SettingsManager.load load()} method
   * before attempting to manage any settings.
   *
   * Prefer calling {@link init} over constructing instances of this class directly, as `init()` automatically loads
   * settings from the file system.
   * @param namespace Namespace of settings to manage.
   */
  public constructor(namespace: string) {
    this.namespace = namespace;
    this.#queuedUpdates = new Map();
  }

  /**
   * Gets a setting.
   * @param key Key of the setting to retrieve.
   * @param fallback Value to return if the key does not already exist.
   * @returns
   */
  public get<K extends Extract<keyof T, string>>(key: K, fallback?: T[K]): T[K] | undefined {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    return this.#settings[key] ?? fallback;
  }

  /**
   * Sets a setting.
   * @param key Key of the setting to set.
   * @param value Value to set for the setting.
   */
  public set<K extends Extract<keyof T, string>>(key: K, value: T[K]): void {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    this.#settings[key] = value;
    this.#queueUpdate(key, { type: "set", value });
  }

  /**
   * Determines whether a setting exists for this namespace.
   * @param key Key to look for.
   * @returns Whether the setting already exists for this namespace.
   */
  public has(key: Extract<keyof T, string>): boolean {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    return key in this.#settings;
  }

  /**
   * Deletes a setting.
   * @param key Key of the setting to delete.
   * @returns Whether the setting was successfully deleted.
   */
  public delete(key: Extract<keyof T, string>): boolean {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    this.#queueUpdate(key, { type: "delete" });
    return Reflect.deleteProperty(this.#settings, key);
  }

  /**
   * Loads the latest stored settings for this namespace from the user's file system into this manager. This must be called
   * before managing any settings, unless you have created an instance using {@link init init()}, which calls this method.
   */
  public async load(): Promise<void> {
    this.#settings = await window.RepluggedNative.settings.all(this.namespace);
  }

  /**
   * Returns a copy of the settings data stored in this manager.
   * @returns Current values of all settings in this manager's namespace.
   */
  public all(): T {
    return { ...this.#settings } as T;
  }

  #queueUpdate<K extends Extract<keyof T, string>>(key: K, update: SettingsUpdate<T>): void {
    if (typeof this.#saveTimeout !== "undefined") {
      clearTimeout(this.#saveTimeout);
    }
    this.#queuedUpdates.set(key, update);
    this.#saveTimeout = setTimeout(() => {
      this.#queuedUpdates.forEach((u, k) => {
        if (u.type === "delete") {
          void window.RepluggedNative.settings.delete(this.namespace, k);
        } else {
          void window.RepluggedNative.settings.set(this.namespace, k, u.value);
        }
      });
      this.#queuedUpdates.clear();
      this.#saveTimeout = void 0;
    }); // Add a delay of 1 or 2 seconds?
  }
}

// I hope there's some way to force TypeScript to accept this, but for now unknown will do
const managers = new Map<string, unknown>();

/**
 * Creates, initializes, and returns a {@link SettingsManager} for the given settings namespace. If a manager for the namespace already exists,
 * then that instance will be returned. Use this function rather than creating instances of `SettingsManager` directly.
 *
 * Settings are stored synchronously in the window, and updates are dispatched asynchronously to the file system.
 * See {@link SettingsManager} for more information on how this works.
 *
 * Here's an example of how to use this in a plugin:
 *
 * ```ts
 * import { settings } from 'replugged';
 *
 * const cfg = await settings.init<{ hello: string }>('dev.replugged.Example');
 *
 * export function start() {
 *   cfg.set('hello', 'world');
 *   console.log(cfg.get('hello')); // world
 * }
 * ```
 * @typeParam T Type definition for the settings to manage in the namespace.
 * This will be an object with strings as keys, and JSON-serializable values.
 * @param namespace Namespace to manage. A namespace is an ID (for example, the ID of a plugin) that uniquely identifies it.
 * All settings are grouped into namespaces.
 * Settings for a namespace are stored in `settings/NAMESPACE.json` within the [Replugged data folder](https://docs.replugged.dev/#installing-plugins-and-themes).
 * @returns Manager for the namespace.
 */
export async function init<T extends Record<string, unknown>>(
  namespace: string,
): Promise<SettingsManager<T>> {
  if (managers.has(namespace)) {
    return managers.get(namespace)! as SettingsManager<T>;
  }
  const manager = new SettingsManager<T>(namespace);
  managers.set(namespace, manager);
  await manager.load();
  return manager;
}
