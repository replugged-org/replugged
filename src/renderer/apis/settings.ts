import { Settings } from "../../types/settings";

export class NamespacedSettings<T extends Settings> {
  public namespace: string;

  public constructor(namespace: string) {
    this.namespace = namespace;
  }

  public async get<K extends Extract<keyof T, string>>(
    key: K,
    fallback?: T[K],
  ): Promise<T[K] | undefined> {
    return (await window.RepluggedNative.settings.get(this.namespace, key)) ?? fallback;
  }

  public set<K extends Extract<keyof T, string>>(key: K, value: T[K]): Promise<void> {
    return window.RepluggedNative.settings.set(this.namespace, key, value);
  }

  public has(key: Extract<keyof T, string>): Promise<boolean> {
    return window.RepluggedNative.settings.has(this.namespace, key);
  }

  public delete(key: Extract<keyof T, string>): Promise<boolean> {
    return window.RepluggedNative.settings.delete(this.namespace, key);
  }

  public all(): Promise<T> {
    return window.RepluggedNative.settings.all(this.namespace);
  }

  public async transaction<U>(handler: (settings: T) => Promise<U>): Promise<U> {
    const settings = await window.RepluggedNative.settings.startTransaction(this.namespace);

    let res: U;

    try {
      res = await handler(settings);
    } catch (e) {
      await window.RepluggedNative.settings.endTransaction(this.namespace, null);
      throw e;
    }

    await window.RepluggedNative.settings.endTransaction(this.namespace, settings);
    return res;
  }
}

class SettingsAPI extends EventTarget {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public settings: Record<string, NamespacedSettings<any>> = {};

  public get<T extends Settings>(namespace: string): NamespacedSettings<T> {
    if (!this.settings[namespace]) {
      this.settings[namespace] = new NamespacedSettings<T>(namespace);
    }
    return this.settings[namespace];
  }
}

export default new SettingsAPI();
