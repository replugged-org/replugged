import type { PlaintextPatch } from "src/types";

const coremodStr = "replugged.coremods.coremods.notices";

export default [
  {
    find: /hasNotice:\w+,sidebarTheme:\w+/,
    replacements: [
      {
        match: /(\w+\.base,children:\[.{0,50})(\w+\.\w+\?null.{10,30}}\)),/,
        replace: (_, prefix, noticeWrapper) =>
          `${prefix}${coremodStr}?.AnnouncementContainer?${coremodStr}.AnnouncementContainer({originalRes:${noticeWrapper}}):${noticeWrapper},`,
      },
    ],
  },
] as PlaintextPatch[];
