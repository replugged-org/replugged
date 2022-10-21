export type DiscordPlatform = "stable" | "ptb" | "canary" | "dev";

export interface PlatformModule {
  getAppDir: (platform: DiscordPlatform) => Promise<string>;
}
