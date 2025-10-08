export type SettingsMap = Map<string, unknown>;
export type TransactionHandler<T> = () => T;
export type SettingsTransactionHandler<T> = (settings: SettingsMap) => T;
