import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.settings";

export default [
  {
    find: "getPredicateSections",
    replacements: [
      {
        match: /(this\.props\.sections\.filter\(.+?\))}/,
        replace: (_, filteredSections) =>
          `${coremodStr}?.insertSections(${filteredSections}) ?? ${filteredSections}};`,
      },
    ],
  },
  {
    find: ".versionHash",
    replacements: [
      {
        match: /\i\.line,\i\.os\),variant:"text-xs\/normal",color:"text-muted",children:\i}\):null/,
        replace: (prefix) => `${prefix},${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\i).join\(" "\)/g,
        replace: (_, copyValues) =>
          `copyValue:[...${copyValues},${coremodStr}?._getVersionString()].join(" ")`,
      },
    ],
  },
] as PlaintextPatch[];
