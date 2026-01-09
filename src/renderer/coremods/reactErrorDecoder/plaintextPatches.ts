import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "https://react.dev/errors/",
    replacements: [
      {
        match: /function \i\(\i\){var \i="https:\/\/react\.dev\/errors\/"\+\i.{100,250}return/,
        replace: (prefix) => `${prefix} $exports?._decodeError(...arguments)??`,
      },
    ],
  },
] as PlaintextPatch[];
