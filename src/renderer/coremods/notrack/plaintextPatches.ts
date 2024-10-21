import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "AnalyticsActionHandlers.handleTrack",
    replacements: [
      {
        match: /=>\w+\.AnalyticsActionHandlers\.handle\w+\([^)]*\)/g,
        replace: "=>{}",
      },
    ],
  },
  {
    find: "window.DiscordSentry",
    replacements: [
      {
        match: /\w+=window\.DiscordSentry/g,
        replace: "false",
      },
    ],
  },
  {
    find: "crashReporter.updateCrashReporter",
    replacements: [{ match: /updateCrashReporter\(\w+\){/, replace: "$&return;" }],
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
