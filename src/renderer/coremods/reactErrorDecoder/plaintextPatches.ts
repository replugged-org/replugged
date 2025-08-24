import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "https://react.dev/errors/",
    replacements: [
      {
        match: /function \w+\(\w+\){var \w+="https:\/\/react.dev\/errors\/"\+\w+.{100,250}return/,
        replace: (prefix) =>
          `${prefix} replugged.coremods.coremods.reactErrorDecoder?._decodeError(...arguments)??`,
      },
    ],
  },
] as PlaintextPatch[];
