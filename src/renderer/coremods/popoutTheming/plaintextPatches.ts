import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "Not injecting stylesheet",
    replacements: [
      {
        match: /\)return void \w+\.warn\("Not injecting/,
        replace: (suffix) => `&&null${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
