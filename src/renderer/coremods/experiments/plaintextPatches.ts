import { init } from "src/renderer/apis/settings";
import { type GeneralSettings, type PlaintextPatch, defaultSettings } from "src/types";

// TODO: see if we can import this from General.tsx
const generalSettings = init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

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
      {
        // Always return true for the 'isStaff' property in SettingRendererUtils
        find: `header:"Developer Only"`,
        replacements: [
          {
            match: /isStaff:\i/,
            replace: `$&||true`,
          },
        ],
      },
      {
        // Add developer only settings to the UserSettingsCogContextMenu
        find: `layoutDebuggingEnabled,isStaff:`,
        replacements: [
          {
            match: /isStaff\(\)\)===!0/,
            replace: `$&||true`,
          },
        ],
      },
      ...(generalSettings.get("staffDevTools")
        ? [
            {
              // Patch the StaffHelpButton component to always show the "Toggle DevTools" button
              find: `staff-help-popout`,
              replacements: [
                {
                  match: /isDiscordDeveloper:\i/,
                  replace: `$&=true`,
                },
              ],
            },
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
      {
        // Always show the ExperimentEmbed
        find: "dev://experiment/",
        replacements: [
          {
            match: ".isStaffPersonal())",
            replace: `$&||true`,
          },
        ],
      },
      {
        // Always show the ManaPlaygroundEmbed
        find: "dev://mana(/",
        replacements: [
          {
            match: ".isStaffPersonal())",
            replace: `$&||true`,
          },
        ],
      },
    ]
  : []) as PlaintextPatch[];
