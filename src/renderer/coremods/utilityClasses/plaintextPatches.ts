import { PlaintextPatch } from "src/types";

export default [
  {
    // re-add aria-controls to all TabBar.Item components, even when it's not currently selected
    find: /"aria-controls":.+\?.+\(""\.concat\(.+\)\):void 0,/,
    replacements: [
      {
        match: /"aria-controls":.+\?(.+\(""\.concat\(.+\)\)):void 0,/,
        replace: (_, tabName) => `"aria-controls":${tabName},`,
      },
    ],
  },
] as PlaintextPatch[];
