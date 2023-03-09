import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "getAvailableLocales",
    replacements: [
      {
        match: /\.Messages\.LANGUAGE,children:((?:[^}]*}){3}[^}]*)/,
        replace: (_, ogChild) =>
          `.Messages.LANGUAGE,children:[replugged.coremods.coremods.language.Card(),${ogChild}]`,
      },
      {
        match: /children:\[(.+\.localeName[^\]]*)]/,
        replace: (_, ogChild) =>
          `children:[replugged.coremods.coremods.language.Percentage(${ogChild})]`,
      },
    ],
  },
] as PlaintextPatch[];
