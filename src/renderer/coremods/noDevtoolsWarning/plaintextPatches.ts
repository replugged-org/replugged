import type { PlaintextPatch } from "src/types";

export default [
  {
    replacements: [
      {
        match: /null!=\w+.SELF_XSS_HEADER/,
        replace: "false",
      },
    ],
  },
] as PlaintextPatch[];
