import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "Shakeable is shaken when not mounted",
    replacements: [
      {
        match: /(\.app,children:\[.+?)\]/,
        replace: (_, prefix) =>
          `${prefix},replugged.coremods?.coremods?.notification?._renderNotification?.()]`,
      },
    ],
  },
] as PlaintextPatch[];
