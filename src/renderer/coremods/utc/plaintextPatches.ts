import { type PlaintextPatch } from "src/types";

export default [
  {
    find: `.jsx=`,
    replacements: [
      {
        match: /return{\$\$typeof:\w+,type:(\w+).+?props:(\w+)/,
        replace: (suffix, type, props) =>
          ` ${props}.className && ${type} !== "html" && (${props}.className = replugged.coremods.coremods.utc?._getClassName(${props}.className));${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
