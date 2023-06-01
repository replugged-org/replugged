import { filters, getExportsForProps, waitForModule, waitForProps } from "../webpack";

export const raw = await waitForModule(filters.bySource("BASE_URL:"));

export const Permissions = getExportsForProps<Record<string, bigint>>(raw, [
  "ADMINISTRATOR",
  "MANAGE_GUILD",
]);
export const Scopes = getExportsForProps<Record<string, string>>(raw, ["BOT", "GUILDS"])!;
export const RPCErrors = getExportsForProps<Record<string, string | number>>(raw, [
  "RATELIMITED",
  "TOKEN_REVOKED",
])!;
export const RPCCommands = getExportsForProps<Record<string, string>>(raw, [
  "AUTHENTICATE",
  "AUTHORIZE",
])!;
export const RPCEvents = getExportsForProps<Record<string, string>>(raw, [
  "GUILD_CREATE",
  "ERROR",
])!;
/** @deprecated Use {@link ColorGenerator} instead */
export const Colors = getExportsForProps<Record<string, string>>(raw, ["GREY1", "GREY2"])!;
export const Status = getExportsForProps<Record<string, string>>(raw, ["ONLINE", "IDLE"])!;
export const Paths = getExportsForProps<Record<string, string>>(raw, ["INDEX", "DOWNLOADS"])!;

export const CSSVariables = await waitForProps<Record<string, string>>(
  "TEXT_NORMAL",
  "BACKGROUND_PRIMARY",
);

interface ColorResponse {
  hex: () => string;
  hsl: () => string;
  int: () => number;
  spring: () => string;
}

interface ShadowColorResponse {
  boxShadow: string;
  filter: string;
  nativeStyles: {
    shadowOffset: { width: number; height: number };
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
    shadowColorAndroid: string;
  };
}

interface Color {
  css: string;
  resolve: (theme: { theme: string; saturation: number }) => ColorResponse;
}

interface ShadowColor {
  css: string;
  resolve: (theme: { theme: string }) => ShadowColorResponse;
}

interface UnsafeRawColor {
  css: string;
  resolve: (theme: { saturation: number }) => ColorResponse;
}

interface ColorMod {
  themes: Record<string, string>;
  colors: Record<string, Color>;
  spacing: Record<string, string>;
  radii: Record<string, number>;
  shadows: Record<string, ShadowColor>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  unsafe_rawColors: Record<string, UnsafeRawColor>;
}

export const ColorGenerator = await waitForModule<ColorMod>(
  filters.bySource(/\w+\.unsafe_rawColors\[\w+\]\.resolve\(\w+\)/),
);

export const Themes = ColorGenerator.themes;
