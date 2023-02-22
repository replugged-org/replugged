import { filters, getExportsForProps, waitForModule } from "../webpack";

export const raw = await waitForModule(filters.bySource("BASE_URL:"));

export const Permissions = getExportsForProps(raw, ["ADMINISTRATOR", "MANAGE_GUILD"])!;
export const Scopes = getExportsForProps(raw, ["BOT", "GUILDS"])!;
export const RPCErrors = getExportsForProps(raw, ["RATELIMITED", "TOKEN_REVOKED"])!;
export const RPCCommands = getExportsForProps(raw, ["AUTHENTICATE", "AUTHORIZE"])!;
export const RPCEvents = getExportsForProps(raw, ["GUILD_CREATE", "ERROR"])!;
export const Colors = getExportsForProps(raw, ["GREY1", "GREY2"])!;
export const Status = getExportsForProps(raw, ["ONLINE", "IDLE"])!;
export const CSSVariables = getExportsForProps(raw, ["TEXT_NORMAL", "BACKGROUND_PRIMARY"])!;
export const Paths = getExportsForProps(raw, ["INDEX", "DOWNLOADS"])!;
