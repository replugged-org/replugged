import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "Shakeable is shaken when not mounted",
    replacements: [
      {
        match: /(\.DnDKeyboardHelpBar.{20,40})]/,
        replace: (_, prefix) =>
          `${prefix},replugged.coremods?.coremods?.notification?._renderNotification?.()]`,
      },
    ],
  },
] as PlaintextPatch[];
