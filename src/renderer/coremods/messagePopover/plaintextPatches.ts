import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'navId:"message-actions"',
    replacements: [
      {
        match: /(\.Fragment,{children:\[)(.{1,75},{label:.{1,100}"copy-id")/,
        replace: (_, prefix, suffix) =>
          `${prefix}...(recelled.coremods.coremods.messagePopover?._buildPopoverElements(arguments[0]?.message,arguments[0]?.channel) ?? []),${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
