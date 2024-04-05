import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.settings";

export default [
  {
    find: "getPredicateSections",
    replacements: [
      {
        match: /this\.props\.sections\.filter\((.+?)\)}/,
        replace: (_, sections) =>
          `${coremodStr}.insertSections(this.props.sections.filter(${sections}))};`,
      },
    ],
  },
  {
    find: ".versionHash",
    replacements: [
      {
        match: /appArch,children:.{0,200}?className:\w+\.line,.{0,100}children:\w+}\):null/,
        replace: `$&,${coremodStr}.VersionInfo()`,
      },
    ],
  },
] as PlaintextPatch[];
