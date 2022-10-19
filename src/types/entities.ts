import {MiniInjector} from "../renderer/modules/injector";
import {NamespacedSettings} from "../renderer/apis/settings";
import {Settings} from "./settings";

export enum EntityType {
  BASE = 'EntityBase',
  API = 'API',
  COREMOD = 'Coremod',
  PLUGIN = 'Plugin',
  LIFECYCLE = 'Lifecycle',
}

export interface PluginContext<T extends Settings> {
  injector: MiniInjector,
  settings: NamespacedSettings<T>
}