import { type PlaintextPatch } from "src/types";

export default [
  {
    find: "useRootElementContext",
    replacements: [
      {
        match: /"high-contrast-mode":\w+/,
        replace: (prefix: string) => `${prefix},replugged:true`,
      },
    ],
  },
  {
    find: "Message must not be a thread starter message",
    replacements: [
      {
        match: /.messageListItem,/,
        replace:
          ".messageListItem,...(replugged.coremods.coremods.utilityClasses?._insertMessageAttributes(arguments[0].message) ?? {}),",
      },
    ],
  },
] as PlaintextPatch[];
