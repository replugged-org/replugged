import type { PlaintextPatch } from "src/types";

const coremodStr = "recelled.coremods.coremods.notices";

export default [
  {
    find: /hasNotice:\w+,sidebarTheme:\w+/,
    replacements: [
      {
        match: /\w+\.base,children:\[/,
        replace: `$&${coremodStr}?.AnnouncementContainer?.(),`,
      },
    ],
  },
] as PlaintextPatch[];
