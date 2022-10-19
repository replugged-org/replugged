import toposort from 'toposort';
import SettingsMod from '../coremods/settings';
import ExperimentsMod from '../coremods/experiments';
import Coremod from '../entities/coremod';
import Target from '../entities/target';
import { signalStart, waitForReady } from '../modules/webpack';
import { log } from '../modules/logger';

export const entities: Record<string, Coremod<any>> = {};

export function add (entity: Coremod<any>) {
  entities[entity.id] = entity;
}

function buildDepChain () {
  const deps = Object.entries(entities).map(([ id, entity ]) => ({
    id,
    dependencies: [ ...entity.dependencies, ...entity.optionalDependencies.filter(d => d in entities) ],
    dependents: [ ...entity.dependents, ...entity.optionalDependents.filter(d => d in entities) ]
  }));

  return deps.flatMap((d) => [ ...d.dependencies.map(id => [ d.id, id ]), ...d.dependents.map(id => [ id, d.id ]) ]) as [string, string][];
}

export async function start () {
  const order = toposort(buildDepChain()).reverse();

  log('Ignition', 'Start', void 0, 'Igniting Replugged...');

  const startTime = performance.now();
  for (const id of order) {
    const entity = entities[id];
    await entity.start();
  }
  const endTime = performance.now();

  log('Ignition', 'Start', void 0, `Finished igniting Replugged in ${endTime - startTime}ms`);
}

export async function stop () {
  const order = toposort(buildDepChain());

  log('Ignition', 'Stop', void 0, 'De-igniting Replugged...');

  const startTime = performance.now();
  for (const id of order) {
    const entity = entities[id];
    await entity.stop();
  }
  const endTime = performance.now();

  log('Ignition', 'Stop', void 0, `Finished de-igniting Replugged in ${endTime - startTime}ms`);
}

export async function restart () {
  await stop();
  await start();
}

// Lifecycle targets

class StartTarget extends Target {
  dependencies = [];
  dependents = [];
  optionalDependencies = [];
  optionalDependents = [];


  constructor () {
    super('dev.replugged.lifecycle.Start', 'Start');
  }
}

class WebpackReadyTarget extends Target {
  dependencies = [ 'dev.replugged.lifecycle.Start' ];
  dependents = [];
  optionalDependencies = [];
  optionalDependents = [];


  constructor () {
    super('dev.replugged.lifecycle.WebpackReady', 'WebpackReady');
  }

  async start () {
    await super.start();
    await waitForReady;
  }
}

class WebpackStartTarget extends Target {
  dependencies = [ 'dev.replugged.lifecycle.WebpackReady' ];
  dependents = [];
  optionalDependencies = [];
  optionalDependents = [];

  constructor () {
    super('dev.replugged.lifecycle.WebpackStart', 'WebpackStart');
  }

  async start () {
    await super.start();
    signalStart();
  }
}

add(new StartTarget());
add(new WebpackReadyTarget());
add(new WebpackStartTarget());
add(new SettingsMod());
add(new ExperimentsMod());
