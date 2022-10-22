import { Awaitable } from "../../src/types/util";

export type DiscordPlatform = "stable" | "ptb" | "canary" | "dev";

export interface PlatformModule {
  getAppDir: (platform: DiscordPlatform) => Awaitable<string>;
}
