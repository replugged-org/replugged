export type Settings = Record<string, unknown>;
export type TransactionHandler<T> = () => Promise<T>;
export type SettingsTransactionHandler<T> = (settings: Settings) => Promise<T>;
