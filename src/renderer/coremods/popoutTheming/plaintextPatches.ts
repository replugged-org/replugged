import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "Not injecting stylesheet",
    replacements: [
      {
        match: /\)return void \i\.warn\("Not injecting/,
        replace: (suffix) => `&&null${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
