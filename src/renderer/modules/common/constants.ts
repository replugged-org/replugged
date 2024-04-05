import { virtualMerge } from "src/renderer/util";
import { filters, getExportsForProps, waitForModule, waitForProps } from "../webpack";

type StringConcat = (...rest: string[]) => string;

const ConstantsCommon = await waitForProps<Record<string, unknown>>("Links", "RPCCommands");
const Constants = await waitForProps<Record<string, unknown>>("Endpoints", "Routes");
export const raw = virtualMerge(ConstantsCommon, Constants);

export const Permissions = getExportsForProps<Record<string, bigint>>(ConstantsCommon, [
  "ADMINISTRATOR",
  "MANAGE_GUILD",
]);
// OAuth2Scopes
export const Scopes = getExportsForProps<Record<string, string>>(ConstantsCommon, [
  "BOT",
  "GUILDS",
])!;
// RPCCloseCodes
export const RPCErrors = getExportsForProps<Record<string, string | number>>(ConstantsCommon, [
  "RATELIMITED",
  "TOKEN_REVOKED",
])!;
export const RPCCommands = getExportsForProps<Record<string, string>>(ConstantsCommon, [
  "AUTHENTICATE",
  "AUTHORIZE",
])!;
export const RPCEvents = getExportsForProps<Record<string, string>>(ConstantsCommon, [
  "GUILD_CREATE",
  "ERROR",
])!;
// StatusTypes
export const Status = getExportsForProps<Record<string, string>>(ConstantsCommon, [
  "ONLINE",
  "IDLE",
])!;
// WebRoutes
export const Paths = getExportsForProps<Record<string, string>>(ConstantsCommon, [
  "INDEX",
  "DOWNLOADS",
])!;

export const ChannelTypes = getExportsForProps<Record<string, string | number>>(Constants, [
  "DM",
  "GUILD_FORUM",
])!;
export const Endpoints = getExportsForProps<Record<string, string | StringConcat>>(Constants, [
  "USERS",
  "INTEGRATIONS",
])!;
export const GuildFeatures = getExportsForProps<Record<string, string>>(Constants, [
  "VERIFIED",
  "ANIMATED_BANNER",
])!;
export const MessageFlags = getExportsForProps<Record<string, number>>(Constants, [
  "EPHEMERAL",
  "LOADING",
])!;
export const Routes = getExportsForProps<Record<string, string | StringConcat>>(Constants, [
  "INDEX",
  "LOGIN",
])!;
export const UserFlags = getExportsForProps<Record<string, string | number>>(Constants, [
  "STAFF",
  "SPAMMER",
])!;

// ThemeColor
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
  modules: Record<string, Record<string, number>>;
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
