import { Injector, webpack } from "@replugged";
import { openNewModal } from "./components/InstallModal";
const injector = new Injector();

export async function start(): Promise<void> {
  console.log("Install links coremod is now starting!");
  openNewModal();
}

export function stop(): void {
  injector.uninjectAll();
}

export async function makePropsModal(): Promise<void> {

}
