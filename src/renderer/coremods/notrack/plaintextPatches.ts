import { PlaintextPatch } from "src/types";

export default [
  {
    replacements: [
      {
        match: /window\.DiscordSentry=function\(\){/,
        replace: "$&return;",
      },
    ],
  },
] as PlaintextPatch[];
