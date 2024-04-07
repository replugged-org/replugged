import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.notices";

export default [
  {
    find: /hasNotice:\w+,sidebarTheme:\w+/,
    replacements: [
      {
        match: /(\w+\.base,children:\[)(.+?}\)),/,
        replace: (_, prefix, noticeWrapper) =>
          `${prefix}${coremodStr}.AnnouncementContainer({originalRes:${noticeWrapper}}),`,
      },
    ],
  },
] as PlaintextPatch[];
