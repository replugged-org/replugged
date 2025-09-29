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
        match:
          /appArch,children:.{0,200}?className:\i\(\)\(\i\.line,\i\.os\),.{0,100}children:\i}\):null/,
        replace: `$&,${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\i).join\(" "\)/g,
        replace: 'copyValue:[...$1,${coremodStr}?._getVersionString()].join(" ")',
      },
    ],
  },
] as PlaintextPatch[];
