import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.language";

export default [
  {
    find: ".flagImage",
    replacements: [
      {
        match: /(title:\i\.\i\.string\(.+?\),children:)((?:[^}]*?}){2}\))/,
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
