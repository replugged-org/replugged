import { Settings } from '../../types/settings';
import API from '../entities/api';

export class NamespacedSettings<T extends Settings> {
  namespace: string;

  constructor (namespace: string) {
    this.namespace = namespace;
  }

  get (key: Extract<keyof T, string>): Promise<T[keyof T]> | undefined {
    return window.RepluggedNative.settings.get(this.namespace, key);
  }

  set (key: Extract<keyof T, string>, value: Promise<T[keyof T]>) {
    return window.RepluggedNative.settings.set(this.namespace, key, value);
  }

  has (key: Extract<keyof T, string>): Promise<boolean> {
    return window.RepluggedNative.settings.has(this.namespace, key);
  }

  delete (key: Extract<keyof T, string>): Promise<void> {
    return window.RepluggedNative.settings.delete(this.namespace, key);
  }

  all (): Promise<T> {
    return window.RepluggedNative.settings.all(this.namespace);
  }

  async transaction <U> (handler: (settings: T) => Promise<U>) {
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
  settings: Record<string, NamespacedSettings<any>> = {};

  constructor () {
    super('dev.replugged.apis.Settings', 'Settings');
  }

  get <T extends Settings> (namespace: string): NamespacedSettings<T> {
    if (!this.settings[namespace]) {
      this.settings[namespace] = new NamespacedSettings <T>(namespace);
    }
    return this.settings[namespace];
  }
}

export default new SettingsAPI();
