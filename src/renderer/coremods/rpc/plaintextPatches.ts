import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "RPC_STORE_WAIT",
    replacements: [
      {
        match: /this,"commands",{}/,
        replace: () => `this,"commands",replugged.rpc?._getCommands({}),`,
      },
    ],
  },
] as PlaintextPatch[];
