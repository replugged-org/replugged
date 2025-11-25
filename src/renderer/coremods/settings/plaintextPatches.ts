import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "getPredicateSections",
    replacements: [
      {
        match: /(this\.props\.sections\.filter\(.+?\))}/,
        replace: (_, filteredSections) =>
          `$exports?.insertSections(${filteredSections}) ?? ${filteredSections}};`,
      },
    ],
  },
  {
    find: ".versionHash",
    replacements: [
      {
        match: /\i\.line,\i\.os\),variant:"text-xs\/normal",color:"text-muted",children:\i}\):null/,
        replace: (prefix) => `${prefix},$exports?.VersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\i).join\(" "\)/g,
        replace: (_, copyValues) =>
          `copyValue:[...${copyValues},$exports?._getVersionString()].join(" ")`,
      },
    ],
  },
] as PlaintextPatch[];
