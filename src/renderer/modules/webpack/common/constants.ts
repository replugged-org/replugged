/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { filters, getExportsForProps, waitForModule } from "..";

export const raw = await waitForModule(filters.bySource("BASE_URL:"));

export const Permissions = getExportsForProps(raw, ["ADMINISTRATOR", "MANAGE_GUILD"])! as Record<
  string,
  bigint
>;
export const Scopes = getExportsForProps(raw, ["BOT", "GUILDS"])! as Record<string, string>;
export const RPCErrors = getExportsForProps(raw, ["RATELIMITED", "TOKEN_REVOKED"])! as Record<
  string,
  string | number
>;
export const RPCCommands = getExportsForProps(raw, ["AUTHENTICATE", "AUTHORIZE"])! as Record<
  string,
  string
>;
export const RPCEvents = getExportsForProps(raw, ["GUILD_CREATE", "ERROR"])! as Record<
  string,
  string
>;
export const Colors = getExportsForProps(raw, ["GREY1", "GREY2"])! as Record<string, string>;
export const Status = getExportsForProps(raw, ["ONLINE", "IDLE"])! as Record<string, string>;
export const CSSVariables = getExportsForProps(raw, [
  "TEXT_NORMAL",
  "BACKGROUND_PRIMARY",
])! as Record<string, string>;
export const Paths = getExportsForProps(raw, ["INDEX", "DOWNLOADS"])! as Record<string, string>;
