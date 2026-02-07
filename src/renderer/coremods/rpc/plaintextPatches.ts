import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "RPC_STORE_WAIT",
    replacements: [
      {
        match: /commands={}/,
        replace: () => `commands=replugged.rpc?._getCommands({})`,
      },
    ],
  },
] as PlaintextPatch[];
