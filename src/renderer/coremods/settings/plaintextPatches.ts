import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.settings";

export default [
  {
    find: "$Root",
    replacements: [
      {
        match: /(\i)\.buildLayout\(\)/,
        replace: (layout, root) => `(${coremodStr}?.SettingsLibs?.insert?.(${root})??${layout})`,
      },
    ],
  },
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
        match: /.appArch,children:.{30,60}\("span",{children:\[" \(",\i,"\)"\]}\)\]}\)/,
        replace: (prefix) => `${prefix},${coremodStr}?._getCompactVersionInfo() ?? null`,
      },
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
