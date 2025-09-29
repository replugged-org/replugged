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
        match: /"N\/A"\)\),null!=\i&&(\i)\.push\(\i\)/,
        replace:
          "$&,$1.push(window.replugged.common.i18n.intl.format(window.replugged.i18n.t.REPLUGGED_VERSION,{version: window.RepluggedNative.getVersion()}))",
      },
    ],
  },
] as PlaintextPatch[];
