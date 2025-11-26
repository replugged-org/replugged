import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.settings";

export default [
  {
    find: '"$Root"',
    replacements: [
      {
        match: /(\i)\.buildLayout\(\)/,
        replace: (layout, root) => `(${coremodStr}?._insertNodes?.(${root})??${layout})`,
      },
    ],
  },
  {
    find: ".versionHash",
    replacements: [
      {
        match: /\.appArch,children:.{30,60}\("span",{children:\[" \(",\i,"\)"\]}\)\]}\)/,
        replace: (prefix) => `${prefix},${coremodStr}?._renderVersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\i).join\(" "\)/g,
        replace: (_, copyValues) =>
          `copyValue:[...${copyValues},${coremodStr}?._getVersionString()].join(" ")`,
      },
    ],
  },
] as PlaintextPatch[];
