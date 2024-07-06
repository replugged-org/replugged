import type { PlaintextPatch } from "src/types";

export default [
  {
    find: 'key:"copy-id"',
    replacements: [
      {
        match:
          /(Fragment,{children:\[)(.{0,200}children:\[.{0,20}?(\w{1,3})\({.{0,5}\s?key:"copy-id".{0,20}channel:(.{1,3})[,}].{0,20}message:(.{1,3})[,}])/,
        replace: (_, prefix, suffix, makeButton, channel, message) =>
          `${prefix}...(replugged.coremods.coremods.messagePopover?._buildPopoverElements(${message},${channel},${makeButton}) ?? []),${suffix}`,
      },
    ],
  },
] as PlaintextPatch[];
