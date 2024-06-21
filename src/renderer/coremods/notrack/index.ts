import { waitForProps } from "@webpack";
import { Injector } from "@replugged";

const inj = new Injector();

export async function start(): Promise<void> {
  const { AnalyticsActionHandlers } = await waitForProps<{
    AnalyticsActionHandlers: {
      handleConnectionClosed: () => void;
      handleConnectionOpen: (e: unknown) => void;
      handleFingerprint: () => void;
      handleTrack: (e: unknown) => void;
    };
  }>("AnalyticsActionHandlers");

  inj.instead(AnalyticsActionHandlers, "handleTrack", () => {});
}

export function stop(): void {
  inj.uninjectAll();
}
