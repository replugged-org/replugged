import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "♫ (つ｡◕‿‿◕｡)つ ♪",
    replacements: [
      {
        match: /(function ..?\((.)\){)(var .,.=.\.navId)/,
        replace: `$1(()=>{replugged.plugins.getExports('dev.replugged.PluginTemplate')?._insertMenuItems?.($2)})();$3`,
      },
    ],
  },
  {
    find: /navId:[\w"-]+,/,
    replacements: [
      {
        match: /(navId:[\w"-]+,)/g,
        replace: `$1data:arguments,`,
      },
    ],
  },
] as PlaintextPatch[];
