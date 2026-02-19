import type { PlaintextPatch } from "src/types";

export default [
  {
    find: '"$Root"',
    replacements: [
      {
        match: /(\i)\.buildLayout\(\)/,
        replace: (layout, root) => `($exports?._insertNodes?.(${root})??${layout})`,
      },
    ],
  },
  {
    find: ".push(`Build Override: ",
    replacements: [
      {
        match: /\i,children:.{30,60}\("span",{children:\[" \(",\i,"\)"\]}\)\]}\)/,
        replace: (prefix) => `${prefix},$exports?._renderVersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\i).join\(" "\)/g,
        replace: (_, copyValues) =>
          `copyValue:[...${copyValues},$exports?._getVersionString()].join(" ")`,
      },
    ],
  },
] as PlaintextPatch[];
