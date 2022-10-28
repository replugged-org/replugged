import Coremod from "../../entities/coremod";
import { patchPlaintext } from "../../modules/webpack";

export default class NoDevtoolsWarningMod extends Coremod<{
  enabled: boolean;
}> {
  public constructor() {
    super("dev.replugged.coremods.NoDevtoolsWarningMod", "nodevtoolswarning");
  }

  public start(): void {
    // nothing
  }

  public stop(): void {
    // nop
  }

  public runPlaintextPatches(): void {
    patchPlaintext([
      {
        find: "setDevtoolsCallbacks",
        replacements: [
          {
            match: /if\(.{0,10}\|\|"0.0.0"!==.{0,2}\.remoteApp\.getVersion\(\)\)/,
            replace: "if(false)",
          },
        ],
      },
    ]);
  }
}
