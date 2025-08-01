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
          /appArch,children:.{0,200}?className:\w+\(\)\(\w+\.line,\w+\.os\),.{0,100}children:\w+}\):null/,
        replace: `$&,${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /\(0,\w+\.jsx\)\(\w+.\w+,{copyValue:(\w+)\.join/,
        replace:
          "$1.push(window.replugged.common.i18n.intl.format(window.replugged.i18n.t.REPLUGGED_VERSION,{version: window.RepluggedNative.getVersion()})),$&",
      },
    ],
  },
] as PlaintextPatch[];
