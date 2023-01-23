import { Injector } from "@replugged";
// import { openNewModal } from "./components/InstallModal";
const injector = new Injector();

export function start(): void {}

export function stop(): void {
  injector.uninjectAll();
}

export async function makePropsModal(): Promise<void> {}
