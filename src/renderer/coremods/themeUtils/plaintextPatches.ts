import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "useRootElementContext",
    replacements: [
      {
        match: /"high-contrast-mode":\i/,
        replace: `$&,...($exports?._insertHTMLClasses() ?? {})`,
      },
    ],
  },
  {
    find: "Message must not be a thread starter message",
    replacements: [
      {
        match: /\.messageListItem,/,
        replace: `$&...($exports?._insertMessageAttributes(arguments[0].message) ?? {}),`,
      },
    ],
  },
  {
    find: "getMaskId()",
    replacements: [
      {
        match: /className:\i\(\)\(\i\.mask/g,
        replace: `...($exports?._insertAvatarAttributes(arguments[0]) ?? {}),$&`,
      },
    ],
  },
] as PlaintextPatch[];
