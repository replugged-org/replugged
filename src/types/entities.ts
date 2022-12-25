import { Awaitable } from "./util";

export interface PluginExports {
  start?: () => Awaitable<void>;
  stop?: () => Awaitable<void>;
}
