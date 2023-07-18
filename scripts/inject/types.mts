import type { Promisable } from "type-fest";

export type DiscordPlatform = "stable" | "ptb" | "canary" | "dev";

export interface PlatformModule {
  getAppDir: (platform: DiscordPlatform) => Promisable<string>;
}

export interface ProcessInfo {
  pid: number;
  cmd: string[];
}

export interface UserData {
  env: NodeJS.ProcessEnv;
  uid: number;
  gid: number;
}
