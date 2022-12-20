import { Injector } from "../renderer/modules/injector";
//import { NamespacedSettings } from "../renderer/apis/settings";
// import { Settings } from "./settings";
import { Awaitable } from "./util";

export enum EntityType {
  BASE = "EntityBase",
  API = "API",
  COREMOD = "Coremod",
  PLUGIN = "Plugin",
  LIFECYCLE = "Lifecycle",
}

export interface PluginContext /*<T extends Settings>*/ {
  injector: Injector;
  //settings: NamespacedSettings<T>;
}

export interface PluginExports {
  start?: (ctx: PluginContext) => Awaitable<void>;
  stop?: (ctx: PluginContext) => Awaitable<void>;
}
