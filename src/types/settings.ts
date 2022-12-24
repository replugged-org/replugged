import { Awaitable } from "./util";

export type SettingsMap = Map<string, unknown>;
export type TransactionHandler<T> = () => Awaitable<T>;
export type SettingsTransactionHandler<T> = (settings: SettingsMap) => Awaitable<T>;
