import type { PlaintextPatch } from "src/types";

export default [
  {
    replacements: [
      {
        match:
          /(Fragment,{children:\[)(.{0,300}return (.+?)\(.{0,10}"add-reaction".{0,50}channel:(.+?),.{0,20}message:(.+?),)/,
        replace: "$1...replugged.api.messagePopover._buildPopoverElements($5,$4,$3),$2",
      },
    ],
  },
] as PlaintextPatch[];
