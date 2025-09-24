import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "useRootElementContext",
    replacements: [
      {
        match: /"high-contrast-mode":\i/,
        replace: `$&,replugged:true,"april-fools":(new Date()).toGMTString().includes("01 Apr")`,
      },
    ],
  },
  {
    find: "Message must not be a thread starter message",
    replacements: [
      {
        match: /\.messageListItem,/,
        replace:
          "$&...(replugged.coremods.coremods.themeUtils?._insertMessageAttributes(arguments[0].message) ?? {}),",
      },
    ],
  },
  {
    find: "getMaskId()",
    replacements: [
      {
        match: /className:\i\(\)\(\i\.mask/g,
        replace: `...(replugged.coremods.coremods.themeUtils?._insertAvatarAttributes(arguments[0]) ?? {}),$&`,
      },
    ],
  },
] as PlaintextPatch[];
