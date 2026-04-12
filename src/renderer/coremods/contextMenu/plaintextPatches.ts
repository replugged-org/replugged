import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "♫ (つ｡◕‿‿◕｡)つ ♪",
    replacements: [
      {
        match: /((\i)\){)(let{navId:)/,
        replace: (_, prefix, props, suffix) =>
          `${prefix}${props}=$exports?._insertMenuItems(${props});${suffix}`,
      },
    ],
  },
  {
    find: "navId:",
    warn: false,
    replacements: [
      {
        match: /(?<!}=this\.props.*?)navId:(?![^(})]*?}=)[^)]*?\)/g,
        replace: `_rpData:arguments,$&`,
      },
    ],
  },
] as PlaintextPatch[];
