import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'Error("Menu',
    replacements: [
      {
        match: /return(\(0,.\.jsx\)\(\w+.OnMenuSelectContext)/,
        replace: (_, suffix) =>
          `return replugged.coremods.coremods.contextMenu._buildPatchedMenu(arguments[0])??${suffix}`,
      },
    ],
  },
  {
    find: ".Menu,{",
    replacements: [
      {
        match: /\.Menu,{/g,
        replace: (prefix) => `${prefix}data:arguments,`,
      },
    ],
  },
] as PlaintextPatch[];
