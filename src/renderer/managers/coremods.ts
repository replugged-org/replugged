import SettingsMod from '../coremods/settings';
import Coremod from '../entities/coremod';
import ExperimentsMod from "../coremods/experiments";

const coremods: Record<string, Coremod<any>> = {
  settings: new SettingsMod(),
  experiments: new ExperimentsMod()
};

export function load (name: string) {
  coremods[name].start();
}

export function unload (name: string) {
  coremods[name].stop();
}

export function reload (name: string) {
  coremods[name].stop();
  coremods[name].start();
}

export function loadAll () {
  Object.values(coremods).forEach(m => m.start());
}

export function unloadAll () {
  Object.values(coremods).forEach(m => m.start());
}

export const list = coremods;
