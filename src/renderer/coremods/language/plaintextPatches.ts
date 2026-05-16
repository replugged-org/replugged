import type { PlaintextPatch } from "src/types";

export default [
  {
    find: ".LANGUAGE_AND_TIME_PANEL)}",
    replacements: [
      {
        match: /(LANGUAGE_AND_TIME_PANEL\)}.{0,150})(value:(\i),options)/,
        replace: `$1helperText:$exports?.getFormattedPercentage($3),$2`,
      },
    ],
  },
] as PlaintextPatch[];
