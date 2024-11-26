import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.language";

export default [
  {
    find: "getAvailableLocales",
    replacements: [
      {
        match: /(\.H1,title:\w+\.intl\.string\(.+?\),children:)((?:[^}]*?}){3}\))/,
        replace: (_, prefix, ogChild) => `${prefix}[${coremodStr}?.Card() ?? null,${ogChild}]`,
      },
      {
        match: /children:\[(.+?\.localeName[^\]]*?)]/,
        replace: (_, ogChild) =>
          `children:${coremodStr}?.Percentage?${coremodStr}.Percentage(${ogChild}):[${ogChild}]`,
      },
    ],
  },
] as PlaintextPatch[];
