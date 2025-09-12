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
        match: /(OVERLAY]};return )(\w+\?\w+:\w+.toSpliced\(3,0,\w+\))/,
        replace: (_, prefix, records) =>
          `${prefix}(${coremodStr}?.insertRecords(${records})??(${records}))`,
      },
      {
        match: /((\w+\[\w+\])\),{tabPredicate:\(\)=>)(null==\w+\|\|\w+\(\w+,\w+,\w+\))/,
        replace: (_, prefix, section, condition) =>
          `${prefix}(!${section}?.tabPredicate||${section}?.tabPredicate?.())&&(${condition})`,
      },
    ],
  },
  {
    find: "user-settings-cog",
    replacements: [
      {
        match: /Object.values\(\w+.\w+\)/,
        replace: (keys: string) => `[...(${coremodStr}?.getSectionKeys() ?? []), ...${keys}]`,
      },
    ],
  },
  {
    find: ".versionHash",
    replacements: [
      {
        match:
          /appArch,children:.{0,200}?className:\i\(\)\(\i\.line,\i\.os\),.{0,100}children:\i}\):null/,
        replace: `$&,${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\w+)\.join/g,
        replace: (_, versionInfo) =>
          `copyValue:[...${versionInfo}, ${coremodStr}?.getVersionInfoText()].join`,
      },
    ],
  },
] as PlaintextPatch[];
