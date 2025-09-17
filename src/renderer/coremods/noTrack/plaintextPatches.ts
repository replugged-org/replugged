import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "AnalyticsActionHandlers.handleTrack",
    replacements: [
      {
        match: /(\(\)|\i)=>\i\.AnalyticsActionHandlers\.handle\i\([^)]*\)/g,
        replace: "arg=>{arg?.resolve?.()}",
      },
    ],
  },
  {
    find: "window.DiscordSentry",
    replacements: [
      {
        match: /\i=window\.DiscordSentry/g,
        replace: "null",
      },
    ],
  },
  {
    find: "crashReporter.updateCrashReporter",
    replacements: [{ match: /updateCrashReporter\(\i\){/, replace: "$&return;" }],
  },
  {
    find: /this\._metrics\.push\(.\),/,
    replacements: [
      {
        match: /this\._metrics\.push\(.\),/,
        replace: "",
      },
    ],
  },
] as PlaintextPatch[];
