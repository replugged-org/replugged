import type { PlaintextPatch } from "src/types";

export default [
  {
    replacements: [
      {
        match:
          /(Fragment,{children:\[)(.{0,300}return (.+?)\(.{0,10}"add-reaction".{0,50}channel:(.+?),.{0,20}message:(.+?),)/,
        replace: (_, prefix, suffix, makeButton, channel, message) =>
          `${prefix}...replugged.api.messagePopover._buildPopoverElements(${message},${channel},${makeButton}),${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
