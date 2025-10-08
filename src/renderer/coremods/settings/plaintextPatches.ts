import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.settings";

export default [
  {
    find: 'section:"logout"',
    replacements: [
      {
        match: /return Object.freeze/,
        replace: (_) => `return (${coremodStr}?.insertSections ?? Object.freeze)`,
      },
    ],
  },
  {
    find: `header:"Developer Only"`,
    replacements: [
      {
        match: /(OVERLAY]};return )(\i\?\i:\i.toSpliced\(3,0,\i\))/,
        replace: (_, prefix, records) =>
          `${prefix}(${coremodStr}?.insertRecords(${records})??(${records}))`,
      },
      {
        match: /((\i\[\i\])\),{tabPredicate:\(\)=>)(null==\i\|\|\i\(\i,\i,\i\))/,
        replace: (_, prefix, section, condition) =>
          `${prefix}(!${section}?.tabPredicate||${section}?.tabPredicate?.())&&(${condition})`,
      },
    ],
  },
  {
    find: "user-settings-cog",
    replacements: [
      {
        match: /Object.values\(\i\.\i\)/,
        replace: (keys: string) => `[...(${coremodStr}?.getSectionKeys() ?? []), ...${keys}]`,
      },
    ],
  },
  {
    find: ".versionHash",
    replacements: [
      {
        match: /\i\.line,\i\.os\),variant:"text-xs\/normal",color:"text-muted",children:\i}\):null/,
        replace: (prefix) => `${prefix},${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\i).join\(" "\)/g,
        replace: (_, copyValues) =>
          `copyValue:[...${copyValues},${coremodStr}?._getVersionString()].join(" ")`,
      },
    ],
  },
] as PlaintextPatch[];
