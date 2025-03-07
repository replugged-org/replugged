import type { PlaintextPatch } from "src/types";

const coremodStr = "recelled.coremods.coremods.settings";

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
        match: /appArch,children:.{0,200}?className:\w+\.line,.{0,100}children:\w+}\):null/,
        replace: `$&,${coremodStr}?.VersionInfo() ?? null`,
      },
    ],
  },
] as PlaintextPatch[];
