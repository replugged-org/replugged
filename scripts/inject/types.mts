import type { Promisable } from "type-fest";

export type DiscordPlatform = "stable" | "ptb" | "canary" | "dev";

export interface PlatformModule {
  getAppDir: (platform: DiscordPlatform) => Promisable<string>;
}

export interface ProcessInfo {
  pid: number;
  ppid: number;
}

export interface UserData {
  env: NodeJS.ProcessEnv;
  uid: number;
  gid: number;
}
