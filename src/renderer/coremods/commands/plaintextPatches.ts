import type { PlaintextPatch } from "src/types";

export default [
  {
    //disables api request to find commands if its added by replugged
    find: "filteredSectionId:null",
    replacements: [
      {
        match: /\w+\({applicationId:(\w+)}/,
        replace: (suffix, id) => `${id} == "replugged"||${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
