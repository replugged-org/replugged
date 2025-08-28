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
    find: ".versionHash",
    replacements: [
      {
        match:
          /appArch,children:.{0,200}?className:\w+\(\)\(\w+\.line,\w+\.os\),.{0,100}children:\w+}\):null/,
        replace: `$&,${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /\(0,\w+\.jsx\)\(\w+.\w+,{copyValue:(\w+)\.join/,
        replace:
          "$1.push(window.replugged.common.i18n.intl.format(window.replugged.i18n.t.REPLUGGED_VERSION,{version: window.RepluggedNative.getVersion()})),$&",
      },
    ],
  },
] as PlaintextPatch[];
