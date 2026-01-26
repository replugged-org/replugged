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
        match: /className:\i\.\i,"aria-setsize":-1,/,
        replace: `$&...($exports?._insertMessageAttributes(arguments[0].message) ?? {}),`,
      },
    ],
  },
  {
    find: "getMaskId()",
    replacements: [
      {
        match: /viewBox:"0 0 "\.concat\(\i," "\)\.concat\(\i\),className:\i\(\)/g,
        replace: `...($exports?._insertAvatarAttributes(arguments[0]) ?? {}),$&`,
      },
    ],
  },
] as PlaintextPatch[];
