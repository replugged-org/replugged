import Experiments from "../coremods/experiments";
import NoDevtoolsWarning from "../coremods/noDevtoolsWarning";
import Settings from "../coremods/settings";

export const coremods = {
  experiments: new Experiments(),
  devtools: new NoDevtoolsWarning(),
  settings: new Settings()
};

export async function start(name: string): Promise<void> {
  await coremods[name as keyof typeof coremods]?.start?.();
}

export async function stop(name: string): Promise<void> {
  await coremods[name as keyof typeof coremods]?.stop?.();
}

export async function startAll(): Promise<void> {
  await Promise.allSettled(Object.values(coremods).map(c => c.start?.()));
}

export async function stopAll(): Promise<void> {
  await Promise.allSettled(Object.values(coremods).map(c => c.stop?.()));
}

export function runPlaintextPatches(): void {
  for (const name in coremods) {
    coremods[name as keyof typeof coremods].runPlaintextPatches?.();
  }
}
