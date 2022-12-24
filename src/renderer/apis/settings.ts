import { Settings } from "../../types/settings";

export class SettingsManager<T extends Settings> {
  #settings: T | undefined;
  #saveTimeout: ReturnType<typeof setTimeout> | undefined;
  #queuedUpdates: Map<Extract<keyof T, string>, T[Extract<keyof T, string>]>;
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
    this.#queueUpdate(key, value);
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
    return Reflect.deleteProperty(this.#settings, key);
  }

  public async load(): Promise<void> {
    this.#settings = await window.RepluggedNative.settings.all(this.namespace);
  }

  public all(): T {
    return { ...this.#settings } as T;
  }

  #queueUpdate<K extends Extract<keyof T, string>>(key: K, value: T[K]): void {
    if (typeof this.#saveTimeout === "number") {
      clearTimeout(this.#saveTimeout);
    }
    this.#queuedUpdates.set(key, value);
    this.#saveTimeout = setTimeout(() => {
      this.#queuedUpdates.forEach((v, k) =>
        window.RepluggedNative.settings.set(this.namespace, k, v),
      );
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
