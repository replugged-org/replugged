import { filters, getExportsForProps, waitForModule } from "../webpack";

export declare class LocalStorage {
  public get: <T>(key: string, defaultValue?: T) => T;
  public set: <T>(key: string, value: T) => void;
  public remove: (key: string) => void;
  public clear: () => void;
  public stringify: () => string;
  public asyncGetRaw: (key: string) => Promise<string | null>;
  public setRaw: (key: string, value: string) => void;
  public getAfterRefresh: <T>(key: string) => Promise<T>;
}

const storageMod = await waitForModule(filters.bySource("delete window.localStorage"));

export default getExportsForProps<LocalStorage>(storageMod, ["getAfterRefresh"])!;
