// @ts-nocheck
import Coremod from "../../entities/coremod";
import { patchPlaintext } from "../../modules/webpack";
import { settingsTools, insertSections } from "./lib";

export default class SettingsMod extends Coremod<Record<string, never>> {
  dependencies = ["dev.replugged.lifecycle.WebpackReady"];
  dependents = ["dev.replugged.lifecycle.WebpackStart"];
  optionalDependencies = [];
  optionalDependents = [];

  constructor() {
    super("dev.replugged.coremods.Settings", "settings");
  }

  async start() {
    // TODO(lexisother): Build UI
    function RPSettings() {
      return <div>wake up wake up wake up</div>;
    }

    // Add our settings elements
    settingsTools.addHeader("Replugged", 35);
    settingsTools.addSection("rp-general", "General", null, RPSettings, 36);
    settingsTools.addDivider(37);

    // Insert our sections into the section array
    patchPlaintext([
      {
        find: ".Messages.USER_SETTINGS_MY_ACCOUNT",
        replacements: [
          {
            match: /return\[\{section((.|\n)+)\}\]/,
            replace: (_, sections) =>
              `return (${insertSections.toString()})([{section${sections}}])`,
          },
        ],
      },
    ]);
  }

  async stop() {
    // placeholder
  }
}
