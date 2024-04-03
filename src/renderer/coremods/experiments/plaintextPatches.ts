import { init } from "src/renderer/apis/settings";
import { type GeneralSettings, type PlaintextPatch, defaultSettings } from "src/types";

// TODO: see if we can import this from General.tsx
const generalSettings = await init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

export default [
  {
    find: /"displayName","(Developer)?ExperimentStore"/,
    replacements: generalSettings.get("experiments")
      ? [
          {
            match: /window\.GLOBAL_ENV\.RELEASE_CHANNEL/g,
            replace: `"staging"`,
          },
          {
            match: /(isDeveloper:{configurable:!1,get:\(\)=>)\w+/g,
            replace: `$1true`,
          },
          {
            match: /=\(0,\w+\.isStaffEnv\)\(\w+\.default\.getCurrentUser\(\)\)/,
            replace: "=true",
          },
        ]
      : [],
  },
] as PlaintextPatch[];
