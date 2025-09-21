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
        match:
          /appArch,children:.{0,200}?className:\i\(\)\(\i\.line,\i\.os\),.{0,100}children:\i}\):null/,
        replace: `$&,${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /copyValue:(\i)\.join/g,
        replace: (_, versionInfo) =>
          `copyValue:[...${versionInfo}, ${coremodStr}?.getVersionInfoText()].join`,
      },
    ],
  },
] as PlaintextPatch[];
