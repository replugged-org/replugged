import { Settings } from "../../types/settings";

type SettingsUpdate<T extends Settings, K extends Extract<keyof T, string>> =
  | {
      type: "set";
      value: T[K];
    }
  | {
      type: "delete";
    };

export class SettingsManager<T extends Settings> {
  #settings: T | undefined;
  #saveTimeout: ReturnType<typeof setTimeout> | undefined;
  #queuedUpdates: Map<Extract<keyof T, string>, SettingsUpdate<T, Extract<keyof T, string>>>;
  public namespace: string;

  public constructor(namespace: string) {
    this.namespace = namespace;
    this.#queuedUpdates = new Map();
  }

  public get<K extends Extract<keyof T, string>>(key: K, fallback?: T[K]): T[K] | undefined {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    return this.#settings[key] ?? fallback;
  }

  public set<K extends Extract<keyof T, string>>(key: K, value: T[K]): void {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    this.#settings[key] = value;
    this.#queueUpdate(key, { type: "set", value });
  }

  public has(key: Extract<keyof T, string>): boolean {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    return key in this.#settings;
  }

  public delete(key: Extract<keyof T, string>): boolean {
    if (typeof this.#settings === "undefined") {
      throw new Error(`Settings not loaded for namespace ${this.namespace}`);
    }
    this.#queueUpdate(key, { type: "delete" });
    return Reflect.deleteProperty(this.#settings, key);
  }

  public async load(): Promise<void> {
    this.#settings = await window.RepluggedNative.settings.all(this.namespace);
  }

  public all(): T {
    return { ...this.#settings } as T;
  }

  #queueUpdate<K extends Extract<keyof T, string>>(key: K, update: SettingsUpdate<T, K>): void {
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

export async function manager<T extends Settings>(namespace: string): Promise<SettingsManager<T>> {
  if (managers.has(namespace)) {
    return managers.get(namespace)! as SettingsManager<T>;
  }
  const manager = new SettingsManager<T>(namespace);
  managers.set(namespace, manager);
  await manager.load();
  return manager;
}
