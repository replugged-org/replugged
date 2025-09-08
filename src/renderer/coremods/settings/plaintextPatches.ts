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
          /appArch,children:.{0,200}?className:\i\(\)\(\i\.line,\i\.os\),.{0,100}children:\i}\):null/,
        replace: `$&,${coremodStr}?.VersionInfo() ?? null`,
      },
      {
        match: /\i\)\?\(0,\i\.jsx\)\(\i\.\i,{copyValue:(\i)\.join/,
        replace:
          "$1.push(window.replugged.common.i18n.intl.format(window.replugged.i18n.t.REPLUGGED_VERSION,{version: window.RepluggedNative.getVersion()})),$&",
      },
    ],
  },
] as PlaintextPatch[];
