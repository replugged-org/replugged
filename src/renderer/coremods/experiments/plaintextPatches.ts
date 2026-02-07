import { generalSettings } from "src/renderer/managers/settings";
import type { PlaintextPatch } from "src/types";

function alwaysTruePatch(find: string | RegExp, match: string | RegExp): PlaintextPatch {
  return { find, replacements: [{ match, replace: `$&||true` }] };
}

export default (generalSettings.get("experiments")
  ? [
      {
        find: /displayName="(Developer)?ExperimentStore"/,
        replacements: [
          // Force the release channel to 'staging'
          {
            match: /window\.GLOBAL_ENV\.RELEASE_CHANNEL/g,
            replace: `"staging"`,
          },
        ],
      },
      {
        find: 'displayName="DeveloperExperimentStore"',
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
      {
        // Patches the AppTitleBar component by gating the isDeveloper check behind the 'staffDevTools' setting
        find: /focusSectionProps:"TITLEBAR_FAST_TRAVEL"/,
        replacements: [
          {
            match: /\i\.\i\.isDeveloper/,
            replace: `$&&&${generalSettings.get("staffDevTools")}`,
          },
        ],
      },
      // Always return true for the 'isStaff' property in SettingRendererUtils
      alwaysTruePatch(`header:"Developer Only"`, /isStaff:\i/),
      // Show the Playgrounds and Build Overrides menu items in the UserSettingsCogContextMenu
      alwaysTruePatch("user-settings-cog", /isStaff\(\)/g),
      // Show the ExperimentEmbed
      alwaysTruePatch("`Clear Treatment ${`", ".isStaffPersonal()"),
      // Show the PlaygroundEmbed
      alwaysTruePatch("data-has-story", ".isStaffPersonal()"),
      // Show the Playgrounds tab in the UserSettingsCogContextMenu
      alwaysTruePatch('label:"Playgrounds"', ".isStaffPersonal()===!0"),
    ]
  : []) as PlaintextPatch[];
