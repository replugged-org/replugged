import Coremod from "../../entities/coremod";
import { patchPlaintext } from "../../modules/webpack";

export default class ExperimentsMod extends Coremod<{
  enabled: boolean;
}> {
  public constructor() {
    super("dev.replugged.coremods.Experiments", "experiments");
  }

  public async start(): Promise<void> {
    /*const enabled = (await this.settings.get("enabled")) ?? false;

    if (enabled) {
      patchPlaintext([
        {
          find: /\.displayName="(Developer)?ExperimentStore"/,
          replacements: [
            {
              match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
              replace: '"staging"',
            },
          ],
        },
      ]);
    }*/
  }

  public async stop(): Promise<void> {
    // placeholder
  }

  public runPlaintextPatches(): void {
    patchPlaintext([
      {
        find: /\.displayName="(Developer)?ExperimentStore"/,
        replacements: [
          {
            match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
            replace: '"staging"',
          },
        ],
      },
    ]);
  }
}
