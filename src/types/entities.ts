import { Awaitable } from "./util";

export enum EntityType {
  BASE = "EntityBase",
  API = "API",
  COREMOD = "Coremod",
  PLUGIN = "Plugin",
  LIFECYCLE = "Lifecycle",
}

export interface PluginExports {
  start?: () => Awaitable<void>;
  stop?: () => Awaitable<void>;
}
