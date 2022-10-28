import { MiniInjector } from "../renderer/modules/injector";
import { NamespacedSettings } from "../renderer/apis/settings";
import { Settings } from "./settings";
import { Awaitable } from "./util";

export enum EntityType {
  BASE = "EntityBase",
  API = "API",
  COREMOD = "Coremod",
  PLUGIN = "Plugin",
  LIFECYCLE = "Lifecycle",
}

export interface PluginContext<T extends Settings> {
  injector: MiniInjector;
  settings: NamespacedSettings<T>;
}

export interface PluginExports<T extends Settings> {
  start?: (ctx: PluginContext<T>) => Awaitable<void>;
  stop?: (ctx: PluginContext<T>) => Awaitable<void>;
  patchPlaintext?: (ctx: PluginContext<T>) => Awaitable<void>;
}
