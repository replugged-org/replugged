import { Settings } from "../../types/settings";
import API from "../entities/api";

export class NamespacedSettings<T extends Settings> {
  public namespace: string;

  public constructor(namespace: string) {
    this.namespace = namespace;
  }

  public get(key: Extract<keyof T, string>): Promise<T[keyof T]> | undefined {
    return window.RepluggedNative.settings.get(this.namespace, key);
  }

  public set(key: Extract<keyof T, string>, value: Promise<T[keyof T]>): Promise<void> {
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

export class SettingsAPI extends API {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public settings: Record<string, NamespacedSettings<any>> = {};

  public constructor() {
    super("dev.replugged.apis.Settings", "Settings");
  }

  public get<T extends Settings>(namespace: string): NamespacedSettings<T> {
    if (!this.settings[namespace]) {
      this.settings[namespace] = new NamespacedSettings<T>(namespace);
    }
    return this.settings[namespace];
  }
}

export default new SettingsAPI();
