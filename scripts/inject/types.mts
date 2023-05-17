import type { Promisable } from "type-fest";

export type DiscordPlatform = "stable" | "ptb" | "canary" | "dev";

export interface PlatformModule {
  getAppDir: (platform: DiscordPlatform) => Promisable<string>;
}
