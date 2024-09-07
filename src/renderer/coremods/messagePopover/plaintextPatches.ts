import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "Messages.MESSAGE_UTILITIES_A11Y_LABEL",
    replacements: [
      {
        match:
          /(\.Fragment,{children:\[)(.{1,25}Fragment.{1,50}(\w+\.\w+),{label:\w+\.\w+\.Messages\.COPY_ID_MESSAGE)/,
        replace: (_, prefix, suffix, makeButton) =>
          `${prefix}...(replugged.coremods.coremods.messagePopover?._buildPopoverElements(arguments[0]?.message,arguments[0]?.channel,${makeButton}) ?? []),${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
