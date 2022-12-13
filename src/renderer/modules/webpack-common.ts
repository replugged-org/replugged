import { Filter, ModuleExports, webpack } from "@replugged";
const { filters, waitForModule } = webpack;
import { Messages, Typing } from "src/types/webpack-common";
import { getExportsForProps } from "./webpack";

async function wrapFilter<T extends ModuleExports>(filter: Filter): Promise<T | null> {
  return (await waitForModule(filter, {
    timeout: Math.max(2_000),
  }).catch(() => null)) as T | null;
}

export const messages = wrapFilter<Messages>(
  filters.byProps("sendMessage", "editMessage", "deleteMessage"),
);

export const typing = wrapFilter<Typing>(filters.byProps("startTyping", "stopTyping"));

export const constants = wrapFilter<ModuleExports>(filters.bySource("BASE_URL:")).then((mod) => {
  if (!mod) return null;

  return {
    raw: mod,
    Permissions: getExportsForProps(mod, ["ADMINISTRATOR", "MANAGE_GUILD"]) as Record<
      string,
      bigint
    >,
    Scopes: getExportsForProps(mod, ["BOT", "GUILDS"]) as Record<string, string>,
    RPCErrors: getExportsForProps(mod, ["RATELIMITED", "TOKEN_REVOKED"]) as Record<
      string | number,
      string | number
    >,
    RPCCommands: getExportsForProps(mod, ["AUTHENTICATE", "AUTHORIZE"]) as Record<string, string>,
    RPCEvents: getExportsForProps(mod, ["GUILD_CREATE", "ERROR"]) as Record<string, string>,
    Colors: getExportsForProps(mod, ["GREY1", "GREY2"]) as Record<string, string>,
    Status: getExportsForProps(mod, ["ONLINE", "IDLE"]) as Record<string, string>,
    CSSVariables: getExportsForProps(mod, ["TEXT_NORMAL", "BACKGROUND_PRIMARY"]) as Record<
      string,
      string
    >,
    Paths: getExportsForProps(mod, ["INDEX", "DOWNLOADS"]) as Record<string, string>,
  };
});
