import { Awaitable } from './util'

export type Settings = Record<string, unknown>;
export type TransactionHandler<T> = () => Awaitable<T>;
export type SettingsTransactionHandler<T> = (settings: Settings) => Awaitable<T>;
