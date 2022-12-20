import Coremod from "../../entities/coremod";
import { patchPlaintext } from "../../modules/webpack";
import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import { General } from "./pages";

export default class SettingsMod extends Coremod {
  public insertSections = insertSections;

  constructor() {
    super("dev.replugged.coremods.Settings", "settings");
  }

  start() {
    settingsTools.addAfter("Billing", [
      /* eslint-disable */
      Divider(),
      Header("Replugged"),
      Section({
        name: "rp-general",
        label: "General",
        elem: General,
      }),
      /* eslint-enable */
    ]);
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
            replace: (_, sections) =>
              `replugged.coremods.coremods.settings.insertSections(this.props.sections.filter(${sections}))};`,
          },
        ],
      },
    ]);
  }
}
