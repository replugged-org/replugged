import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.language";

export default [
  {
    find: "getAvailableLocales",
    replacements: [
      {
        match: /(\.Messages\.LANGUAGE,)\s*children:((?:[^}]*?}){3}\))/,
        replace: (_, prefix, ogChild) => `${prefix}children:[${coremodStr}.Card(),${ogChild}]`,
      },
      {
        match: /children:\[(.+?\.localeName[^\]]*?)]/,
        replace: (_, ogChild) => `children:[${coremodStr}.Percentage(${ogChild})]`,
      },
    ],
  },
] as PlaintextPatch[];
