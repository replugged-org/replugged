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
] as PlaintextPatch[];
