import { type PlaintextPatch } from "src/types";

export default [
  {
    find: `.jsx=`,
    replacements: [
      {
        match: /return{\$\$typeof:\i,type:(\i).+?props:(\i)/,
        replace: (suffix, type, props) => `$exports?._patchClassName(${props}, ${type});${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
