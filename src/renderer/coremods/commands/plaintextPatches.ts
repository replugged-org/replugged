import { REPLUGGED_CLYDE_ID } from "src/constants";
import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "/\\.gif($|\\?|#)/i",
    replacements: [
      {
        match: /getSrc\(\i\){/,
        replace: (prefix) =>
          `${prefix}if(this.props.sourceMetadata?.message?.author?.id==="${REPLUGGED_CLYDE_ID}")return this.props.src;`,
      },
    ],
  },
] as PlaintextPatch[];
