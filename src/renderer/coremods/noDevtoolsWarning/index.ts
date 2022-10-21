import Coremod from "../../entities/coremod";
import { patchPlaintext } from "../../modules/webpack";

export default class NoDevtoolsWarningMod extends Coremod<{
  enabled: boolean;
}> {
  public dependencies = [];
  public dependents = [];
  public optionalDependencies = [];
  public optionalDependents = [];

  public constructor() {
    super("dev.replugged.coremods.NoDevtoolsWarningMod", "nodevtoolswarning");
  }

  public start(): void {
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

  public async stop(): Promise<void> {
    // nop
  }
}
