import { filters, getExportsForProps, waitForModule } from "../webpack";

export const raw = await waitForModule(filters.bySource("BASE_URL:"));

export const Permissions = getExportsForProps<string, Record<string, bigint>>(raw, [
  "ADMINISTRATOR",
  "MANAGE_GUILD",
]);
export const Scopes = getExportsForProps<string, Record<string, string>>(raw, ["BOT", "GUILDS"])!;
export const RPCErrors = getExportsForProps<string, Record<string, string | number>>(raw, [
  "RATELIMITED",
  "TOKEN_REVOKED",
])!;
export const RPCCommands = getExportsForProps<string, Record<string, string>>(raw, [
  "AUTHENTICATE",
  "AUTHORIZE",
])!;
export const RPCEvents = getExportsForProps<string, Record<string, string>>(raw, [
  "GUILD_CREATE",
  "ERROR",
])!;
export const Colors = getExportsForProps<string, Record<string, string>>(raw, ["GREY1", "GREY2"])!;
export const Status = getExportsForProps<string, Record<string, string>>(raw, ["ONLINE", "IDLE"])!;
export const CSSVariables = getExportsForProps<string, Record<string, string>>(raw, [
  "TEXT_NORMAL",
  "BACKGROUND_PRIMARY",
])!;
export const Paths = getExportsForProps<string, Record<string, string>>(raw, [
  "INDEX",
  "DOWNLOADS",
])!;
