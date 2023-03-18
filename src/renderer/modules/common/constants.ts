import { filters, getExportsForProps, waitForModule, waitForProps } from "../webpack";

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
export const Paths = getExportsForProps<string, Record<string, string>>(raw, [
  "INDEX",
  "DOWNLOADS",
])!;

export const CSSVariables = await waitForProps<string, Record<string, string>>(
  "TEXT_NORMAL",
  "BACKGROUND_PRIMARY",
);

interface ColorResponse {
  hex: () => string;
  hsl: () => string;
  int: () => number;
  spring: () => string;
}

interface Color {
  css: string;
  resolve: (theme: { theme: string; saturation: number }) => ColorResponse;
}

interface UnsafeRawColor {
  css: string;
  resolve: (theme: { saturation: number }) => ColorResponse;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ColorMod = {
  themes: Record<string, string>;
  colors: Record<string, Color>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  unsafe_rawColors: Record<string, UnsafeRawColor>;
};

export const ColorGenerator = await waitForModule<ColorMod>(
  filters.bySource(/\w+\.unsafe_rawColors\[\w+\]\.resolve\(\w+\)/),
);

export const Themes = ColorGenerator.themes;
