import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.themeUtils";

export default [
  {
    find: "useRootElementContext",
    replacements: [
      {
        match: /"high-contrast-mode":\i/,
        replace: `$&,...(${coremodStr}?._insertHTMLClasses() ?? {})`,
      },
    ],
  },
  {
    find: "Message must not be a thread starter message",
    replacements: [
      {
        match: /\.messageListItem,/,
        replace: `$&...(${coremodStr}?._insertMessageAttributes(arguments[0].message) ?? {}),`,
      },
    ],
  },
  {
    find: "getMaskId()",
    replacements: [
      {
        match: /className:\i\(\)\(\i\.mask/g,
        replace: `...(${coremodStr}?._insertAvatarAttributes(arguments[0]) ?? {}),$&`,
      },
    ],
  },
] as PlaintextPatch[];
