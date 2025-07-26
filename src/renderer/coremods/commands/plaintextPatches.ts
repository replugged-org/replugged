import type { PlaintextPatch } from "src/types";
import { REPLUGGED_CLYDE_ID } from "src/constants";

export default [
  {
    find: "/\\.gif($|\\?|#)/i",
    replacements: [
      {
        match: /getSrc\(\w+\){/,
        replace: (prefix) =>
          `${prefix}if(this.props.sourceMetadata?.message?.author?.id==="${REPLUGGED_CLYDE_ID}")return this.props.src;`,
      },
    ],
  },
] as PlaintextPatch[];
