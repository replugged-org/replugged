import React from "../../modules/common/react";
import Coremod from "../../entities/coremod";
import { patchPlaintext } from "../../modules/webpack";
import { insertSections, settingsTools } from "./lib";

export default class SettingsMod extends Coremod {
  dependencies = ["dev.replugged.lifecycle.WebpackReady"];
  dependents = ["dev.replugged.lifecycle.WebpackStart"];
  optionalDependencies = [];
  optionalDependents = [];

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
    settingsTools.addHeader("Replugged", 35);
    settingsTools.addSection({
      name: "rp-general",
      label: "General",
      elem: RPSettings,
      pos: 36,
    });
    settingsTools.addDivider(37);

    // Insert our sections into the section array
    patchPlaintext([
      {
        find: ".Messages.USER_SETTINGS_MY_ACCOUNT",
        replacements: [
          {
            match: /return\[\{section((.|\n)+)\}\]/,
            replace: (_, sections) =>
              `return replugged.ignition.entities['${this.id}'].insertSections([{section${sections}}])`,
          },
        ],
      },
    ]);
  }

  async stop() {
    // placeholder
  }
}
