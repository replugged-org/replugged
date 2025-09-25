import { generalSettings } from "src/renderer/managers/settings";
import type { PlaintextPatch } from "src/types";

function alwaysTruePatch(find: string | RegExp, match: string | RegExp): PlaintextPatch {
  return { find, replacements: [{ match, replace: `$&||true` }] };
}

export default (generalSettings.get("experiments")
  ? [
      {
        find: /"displayName","(Developer)?ExperimentStore"/,
        replacements: [
          // Force the release channel to 'staging'
          {
            match: /window\.GLOBAL_ENV\.RELEASE_CHANNEL/g,
            replace: `"staging"`,
          },
        ],
      },
      {
        find: '"displayName","DeveloperExperimentStore"',
        replacements: [
          // Force the 'isDeveloper' property to true
          {
            match: /(isDeveloper:{configurable:!1,get:\(\)=>)\i/g,
            replace: `$1true`,
          },
          // Set the result of 'isStaffEnv' to be always true
          {
            match: /=\(0,\i\.\i\)\(\i\.default\.getCurrentUser\(\)\)/,
            replace: "=true",
          },
        ],
      },
      ...(generalSettings.get("staffDevTools")
        ? [
            {
              // Set the resulting experiment configuration of the bug reporter to be always true
              // This is necessary to ensure the StaffHelpButton is shown instead of the classic HelpButton
              find: /hasBugReporterAccess:\i}=\i\.\i\.useExperiment/,
              replacements: [
                {
                  match: /hasBugReporterAccess:\i/,
                  replace: `_$&=true`,
                },
              ],
            },
          ]
        : []),
      // Always return true for the 'isStaff' property in SettingRendererUtils
      alwaysTruePatch(`header:"Developer Only"`, /isStaff:\i/),
      // Add developer only settings to the UserSettingsCogContextMenu
      alwaysTruePatch(`layoutDebuggingEnabled,isStaff:`, "isStaff())===!0"),
      // Show the Playgrounds and Build Overrides menu items in the UserSettingsCogContextMenu
      alwaysTruePatch("user-settings-cog", /isStaff\(\)/g),
      // Show the ExperimentEmbed
      alwaysTruePatch("dev://experiment/", ".isStaffPersonal())"),
      // Show the ManaPlaygroundEmbed
      alwaysTruePatch("dev://mana(/", ".isStaffPersonal())"),
      // Show the Playgrounds tab in the StaffHelpPopout
      alwaysTruePatch("Playgrounds", ".isStaffPersonal())===!0"),
    ]
  : []) as PlaintextPatch[];
