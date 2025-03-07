import { virtualMerge } from "src/renderer/util";
import { filters, getExportsForProps, waitForModule, waitForProps } from "../webpack";

type StringConcat = (...rest: string[]) => string;

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
  layout: Record<string, string>;
}

interface returnType {
  raw: ReturnType<typeof virtualMerge & Record<string, unknown>>;
  Permissions: Record<string, bigint>;
  Scopes: Record<string, string>;
  RPCErrors: Record<string, string | number>;
  RPCCommands: Record<string, string>;
  RPCEvents: Record<string, string>;
  Status: Record<string, string>;
  Paths: Record<string, string>;
  ChannelTypes: Record<string, string | number>;
  Endpoints: Record<string, string | StringConcat>;
  GuildFeatures: Record<string, string>;
  MessageFlags: Record<string, number>;
  Routes: Record<string, string | StringConcat>;
  UserFlags: Record<string, string | number>;
  CSSVariables: Record<string, string>;
  ColorGenerator: ColorMod;
  Themes: ColorMod["themes"];
}

const getConstants = async (): Promise<returnType> => {
  const ConstantsCommon = await waitForModule<Record<string, unknown>>(
    filters.bySource("dis.gd/request"),
  );
  const Constants = await waitForModule<Record<string, unknown>>(
    filters.bySource("users/@me/relationships"),
  );
  const raw = virtualMerge(ConstantsCommon, Constants);

  const Permissions = getExportsForProps<Record<string, bigint>>(ConstantsCommon, [
    "ADMINISTRATOR",
    "MANAGE_GUILD",
  ])!;
  // OAuth2Scopes
  const Scopes = await waitForProps<Record<string, string>>("BOT", "GUILDS");
  // RPCCloseCodes
  const RPCErrors = getExportsForProps<Record<string, string | number>>(ConstantsCommon, [
    "RATELIMITED",
    "TOKEN_REVOKED",
  ])!;
  const RPCCommands = getExportsForProps<Record<string, string>>(ConstantsCommon, [
    "AUTHENTICATE",
    "AUTHORIZE",
  ])!;
  const RPCEvents = getExportsForProps<Record<string, string>>(ConstantsCommon, [
    "GUILD_CREATE",
    "ERROR",
  ])!;
  // StatusTypes
  const Status = getExportsForProps<Record<string, string>>(ConstantsCommon, ["ONLINE", "IDLE"])!;
  // WebRoutes
  const Paths = getExportsForProps<Record<string, string>>(ConstantsCommon, [
    "INDEX",
    "DOWNLOADS",
  ])!;

  const ChannelTypes = getExportsForProps<Record<string, string | number>>(Constants, [
    "DM",
    "GUILD_FORUM",
  ])!;
  const Endpoints = getExportsForProps<Record<string, string | StringConcat>>(Constants, [
    "USERS",
    "INTEGRATIONS",
  ])!;
  const GuildFeatures = getExportsForProps<Record<string, string>>(Constants, [
    "VERIFIED",
    "ANIMATED_BANNER",
  ])!;
  const MessageFlags = getExportsForProps<Record<string, number>>(Constants, [
    "EPHEMERAL",
    "LOADING",
  ])!;
  const Routes = getExportsForProps<Record<string, string | StringConcat>>(Constants, [
    "INDEX",
    "LOGIN",
  ])!;
  const UserFlags = getExportsForProps<Record<string, string | number>>(Constants, [
    "STAFF",
    "SPAMMER",
  ])!;

  // ThemeColor
  const CSSVariables = await waitForProps<Record<string, string>>(
    "TEXT_NORMAL",
    "BACKGROUND_PRIMARY",
  );

  const ColorGenerator = await waitForProps<ColorMod>("unsafe_rawColors", "layout");

  const Themes = ColorGenerator.themes;

  return {
    raw,
    Permissions,
    Scopes,
    RPCErrors,
    RPCCommands,
    RPCEvents,
    Status,
    Paths,
    ChannelTypes,
    Endpoints,
    GuildFeatures,
    MessageFlags,
    Routes,
    UserFlags,
    CSSVariables,
    ColorGenerator,
    Themes,
  };
};

export default getConstants();
