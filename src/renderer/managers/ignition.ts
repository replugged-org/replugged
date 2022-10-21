import toposort from "toposort";
import SettingsMod from "../coremods/settings";
import ExperimentsMod from "../coremods/experiments";
import Coremod from "../entities/coremod";
import Target from "../entities/target";
import { byPropsFilter, signalStart, waitFor, waitForReady } from "../modules/webpack";
import { log } from "../modules/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const entities: Record<string, Coremod<any>> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function add(entity: Coremod<any>): void {
  entities[entity.id] = entity;
}

function buildDepChain(): Array<[string, string]> {
  const deps = Object.entries(entities).map(([id, entity]) => ({
    id,
    dependencies: [
      ...entity.dependencies,
      ...entity.optionalDependencies.filter((d) => d in entities),
    ],
    dependents: [...entity.dependents, ...entity.optionalDependents.filter((d) => d in entities)],
  }));

  return deps.flatMap((d) => [
    ...d.dependencies.map((id) => [d.id, id]),
    ...d.dependents.map((id) => [id, d.id]),
  ]) as Array<[string, string]>;
}

export async function start(): Promise<void> {
  const order = toposort(buildDepChain()).reverse();

  log("Ignition", "Start", void 0, "Igniting Replugged...");

  const startTime = performance.now();
  for (const id of order) {
    const entity = entities[id];
    await entity.start();
  }
  const endTime = performance.now();

  log("Ignition", "Start", void 0, `Finished igniting Replugged in ${endTime - startTime}ms`);
}

export async function stop(): Promise<void> {
  const order = toposort(buildDepChain());

  log("Ignition", "Stop", void 0, "De-igniting Replugged...");

  const startTime = performance.now();
  for (const id of order) {
    const entity = entities[id];
    await entity.stop();
  }
  const endTime = performance.now();

  log("Ignition", "Stop", void 0, `Finished de-igniting Replugged in ${endTime - startTime}ms`);
}

export async function restart(): Promise<void> {
  await stop();
  await start();
}

// Lifecycle targets

class StartTarget extends Target {
  public dependencies = [];
  public dependents = [];
  public optionalDependencies = [];
  public optionalDependents = [];

  public constructor() {
    super("dev.replugged.lifecycle.Start", "Start");
  }
}

class WebpackReadyTarget extends Target {
  public dependencies = ["dev.replugged.lifecycle.Start"];
  public dependents = [];
  public optionalDependencies = [];
  public optionalDependents = [];

  public constructor() {
    super("dev.replugged.lifecycle.WebpackReady", "WebpackReady");
  }

  public async start(): Promise<void> {
    await super.start();
    await waitForReady;
  }
}

class WebpackStartTarget extends Target {
  public dependencies = ["dev.replugged.lifecycle.WebpackReady"];
  public dependents = [];
  public optionalDependencies = [];
  public optionalDependents = [];

  public constructor() {
    super("dev.replugged.lifecycle.WebpackStart", "WebpackStart");
  }

  public async start(): Promise<void> {
    await super.start();
    signalStart();
    // lexisother(TODO): Make this not do what this does, do something better
    // instead.
    await waitFor(
      byPropsFilter(["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED", "createElement"]),
    ).then((React) => (window.React = React as typeof window.React));
  }
}

add(new StartTarget());
add(new WebpackReadyTarget());
add(new WebpackStartTarget());
add(new SettingsMod());
add(new ExperimentsMod());
