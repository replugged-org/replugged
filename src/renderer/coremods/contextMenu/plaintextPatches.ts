import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "navId:",
    replacements: [
      {
        match: /navId:[\w"-]+,/g,
        replace: (navId) => `${navId}data:arguments,`,
      },
    ],
  },
] as PlaintextPatch[];
