import { filters, getExportsForProps, waitForModule } from "..";

export const raw = await waitForModule(filters.bySource("BASE_URL:"));

export const Permissions: Record<string, bigint> = getExportsForProps(raw, [
  "ADMINISTRATOR",
  "MANAGE_GUILD",
])!;
export const Scopes: Record<string, string> = getExportsForProps(raw, ["BOT", "GUILDS"])!;
export const RPCErrors: Record<string, string | number> = getExportsForProps(raw, [
  "RATELIMITED",
  "TOKEN_REVOKED",
])!;
export const RPCCommands: Record<string, string> = getExportsForProps(raw, [
  "AUTHENTICATE",
  "AUTHORIZE",
])!;
export const RPCEvents: Record<string, string> = getExportsForProps(raw, [
  "GUILD_CREATE",
  "ERROR",
])!;
export const Colors: Record<string, string> = getExportsForProps(raw, ["GREY1", "GREY2"])!;
export const Status: Record<string, string> = getExportsForProps(raw, ["ONLINE", "IDLE"])!;
export const CSSVariables: Record<string, string> = getExportsForProps(raw, [
  "TEXT_NORMAL",
  "BACKGROUND_PRIMARY",
])!;
export const Paths: Record<string, string> = getExportsForProps(raw, ["INDEX", "DOWNLOADS"])!;
