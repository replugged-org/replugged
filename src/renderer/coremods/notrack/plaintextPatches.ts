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
    find: "TRACKING_URL:",
    replacements: [
      {
        replace: "()=>{}",
      },
    ],
  },
  {
    find: /this\.metrics\.push\(.\);/,
    replacements: [
      {
        match: /this\.metrics\.push\(.\);/,
        replace: "",
      },
    ],
  },
] as PlaintextPatch[];
