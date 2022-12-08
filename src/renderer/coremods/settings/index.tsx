import Coremod from "../../entities/coremod";
import { patchPlaintext } from "../../modules/webpack";
import { insertSections, settingsTools } from "./lib";

export default class SettingsMod extends Coremod {
  public insertSections = insertSections;

  constructor() {
    super("dev.replugged.coremods.Settings", "settings");
  }

  start() {
    // TODO(lexisother): Build UI
    function RPSettings() {
      return <div>wake up wake up wake up</div>;
    }

    // Add our settings elements
    settingsTools.addDivider(35);
    settingsTools.addHeader("Replugged", 36);
    settingsTools.addSection({
      name: "rp-general",
      label: "General",
      elem: RPSettings,
      pos: 37,
    });
    settingsTools.addDivider(38);
  }

  async stop() {
    // placeholder
  }

  public runPlaintextPatches(): void {
    patchPlaintext([
      {
        find: "getPredicateSections",
        replacements: [
          {
            match: /this\.props\.sections\.filter\((.+)\)\};/,
            replace:
              "replugged.coremods.coremods.settings.insertSections(this.props.sections.filter($1))};",
          },
        ],
      },
    ]);
  }
}
