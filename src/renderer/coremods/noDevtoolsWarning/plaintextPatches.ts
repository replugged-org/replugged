import type { PlaintextPatch } from "src/types";

export default [
  {
    replacements: [
      {
        match: /null!=\w+\.\w+\.Messages\.SELF_XSS_HEADER/,
        replace: "false",
      },
    ],
  },
] as PlaintextPatch[];
