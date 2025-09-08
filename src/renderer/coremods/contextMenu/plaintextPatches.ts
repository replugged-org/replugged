import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "♫ (つ｡◕‿‿◕｡)つ ♪",
    replacements: [
      {
        match: /((\i)\){)(var\s*\i;let{navId:)/,
        replace: (_, prefix, props, suffix) =>
          `${prefix}${props}=replugged.coremods.coremods.contextMenu?._insertMenuItems(${props});${suffix}`,
      },
    ],
  },
  {
    find: "navId",
    warn: false,
    replacements: [
      {
        match: /navId:(?![^(})]*?}=)[^)]*?\)/g,
        replace: (suffix) => `data:arguments,${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
