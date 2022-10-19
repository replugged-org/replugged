// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import {RepluggedPlugin} from "../../types";
import Plugin from "../entities/plugin";
import {PluginContext} from "../../types/entities";
import {add} from "./ignition";

export async function get <T extends typeof Plugin> (plugin: RepluggedPlugin): Promise<new () => Plugin<any>> {
  const renderer = await import(`replugged://plugin/${plugin.id}/${plugin.manifest.renderer}`);

  return class extends Plugin<any> {
    dependencies = plugin.manifest.dependencies?.required ?? []
    dependents = plugin.manifest.dependents?.required ?? []

    optionalDependencies = plugin.manifest.dependencies?.optional ?? [];
    optionalDependents = plugin.manifest.dependents?.optional ?? [];

    constructor() {
      super(plugin.manifest.id, plugin.manifest.name);
    }

    async start() {
      const context: PluginContext<any> = {
        injector: this.injector,
        settings: this.settings,
      };

      await renderer.start(context)
    }

    async stop() {
      await renderer.stop()
    }
  }
}

export async function all () {
  const plugins = await window.RepluggedNative.plugins.list();
  return await Promise.all(plugins.map(p => get(p)))
}

export async function load() {
  const plugins = await all();
  plugins.forEach(p => add(new p()))
}