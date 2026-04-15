import type { PlaintextPatch } from "src/types";

export default [
  {
    find: ".LANGUAGE_AND_TIME_PANEL,{section:",
    replacements: [
      {
        match: /value:(\i),options/,
        replace: `helperText:$exports?.getFormattedPercentage($1),$&`,
      },
    ],
  },
] as PlaintextPatch[];
