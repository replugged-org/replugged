import { Injector } from "../../modules/injector";
import { filters, getFunctionKeyBySource, waitForModule } from "../../modules/webpack";

const injector = new Injector();

export async function start(): Promise<void> {
  const clientCheckerMod = await waitForModule<Record<string, () => boolean>>(
    filters.bySource(".$||"),
  );
  const clientCheckerKey = getFunctionKeyBySource(clientCheckerMod, ".$||")!;

  injector.instead(clientCheckerMod, clientCheckerKey, () => false);
}

export function stop(): void {
  injector.uninjectAll();
}
