import SettingsMod from '../coremods/settings';
import Coremod from '../entities/coremod';

const coremods: Record<string, Coremod> = {
  settings: new SettingsMod()
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
