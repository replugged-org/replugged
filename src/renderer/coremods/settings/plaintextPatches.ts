import { PlaintextPatch } from "src/types";

export default [
  {
    find: "getPredicateSections",
    replacements: [
      {
        match: /this\.props\.sections\.filter\((.+)\)\};/,
        replace: (_, sections) =>
          `replugged.coremods.coremods.settings.insertSections(this.props.sections.filter(${sections}))};`,
      },
    ],
  },
] as PlaintextPatch[];
