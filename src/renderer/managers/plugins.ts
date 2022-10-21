// btw, pluginID is the directory name, not the RDNN. We really need a better name for this.
import { RepluggedPlugin } from "../../types";
import Plugin from "../entities/plugin";
import { PluginContext } from "../../types/entities";
import { add } from "./ignition";

export async function get(
  plugin: RepluggedPlugin,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<new () => Plugin<any>> {
  const renderer = await import(`replugged://plugin/${plugin.id}/${plugin.manifest.renderer}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class extends Plugin<any> {
    public dependencies = plugin.manifest.dependencies?.required ?? [];
    public dependents = plugin.manifest.dependents?.required ?? [];

    public optionalDependencies = plugin.manifest.dependencies?.optional ?? [];
    public optionalDependents = plugin.manifest.dependents?.optional ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public context: PluginContext<any> = {
      injector: this.injector,
      settings: this.settings,
    };

    public constructor() {
      super(plugin.manifest.id, plugin.manifest.name);
    }

    public async start(): Promise<void> {
      await renderer.start(this.context);
    }

    public async stop(): Promise<void> {
      await renderer.stop(this.context);
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function all(): Promise<Array<new () => Plugin<any>>> {
  const plugins = await window.RepluggedNative.plugins.list();
  return Promise.all(plugins.map((p) => get(p)));
}

export async function load(): Promise<void> {
  const plugins = await all();
  plugins.forEach((P) => add(new P()));
}
