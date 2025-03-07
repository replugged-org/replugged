import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "♫ (つ｡◕‿‿◕｡)つ ♪",
    replacements: [
      {
        match: /((\w+)\){)(var\s*\w+;let{navId:)/,
        replace: (_, prefix, props, suffix) =>
          `${prefix}${props}=recelled.coremods.coremods.contextMenu?._insertMenuItems(${props});${suffix}`,
      },
    ],
  },
  {
    find: "navId",
    replacements: [
      {
        match: /navId:(?![^(})]*?}=)[^)]*?\)/g,
        replace: (suffix) => `data:arguments,${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
