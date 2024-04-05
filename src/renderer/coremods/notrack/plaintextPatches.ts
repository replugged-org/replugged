import type { PlaintextPatch } from "src/types";

export default [
  {
    replacements: [
      {
        match: /window\.DiscordSentry=function\(\){/,
        replace: "$&return;",
      },
      {
        match: /crossDomainError=function\(\){/,
        replace: "$&return;",
      },
    ],
  },
  {
    find: "window.DiscordSentry",
    replacements: [
      {
        match: /null!=window.DiscordSentry/g,
        replace: "false",
      },
    ],
  },
  {
    find: "crashReporter.updateCrashReporter",
    replacements: [{ match: /updateCrashReporter\(\w+\){/, replace: "$&return;" }],
  },
  {
    find: "TRACKING_URL:",
    replacements: [
      {
        replace: "",
      },
    ],
  },
  {
    find: /this\._metrics\.push\(.\);/,
    replacements: [
      {
        match: /this\._metrics\.push\(.\);/,
        replace: "",
      },
    ],
  },
] as PlaintextPatch[];
