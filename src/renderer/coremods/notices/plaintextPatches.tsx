import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.notices";

export default [
  {
    find: /\)\.content.+?hasNotice/,
    replacements: [
      {
        match: /(\w+\.base,children:\[)(.+?}\)),/,
        replace: (_, prefix, noticeWrapper) =>
          `${prefix}${coremodStr}.AnnouncementContainer({originalRes:${noticeWrapper}}),`,
      },
    ],
  },
] as PlaintextPatch[];
