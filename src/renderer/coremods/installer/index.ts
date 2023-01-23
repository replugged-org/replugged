import { Injector } from "@replugged";
import { installFlow } from "./util";

const injector = new Injector();

export function start(): void {}

export function stop(): void {
  injector.uninjectAll();
}

export { installFlow };
