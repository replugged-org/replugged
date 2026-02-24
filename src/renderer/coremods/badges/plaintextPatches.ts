import type { PlaintextPatch } from "src/types";

export default [
  {
    // Edit the ProfileBadges component
    find: /action:"PRESS_BADGE"/,
    replacements: [
      // Add the "replugged-badge" class and render a div with children for custom badges
      {
        match:
          /("img",.{20,50}?src:(\i)\.iconSrc\?\?\(0,\i\.\i\)\(\i\.icon\),className:\i\(\)\(\i\.\i,\i)\)/,
        replace: `$2.component?"div":$1,{["replugged-badge"]:$2.component}),children:$2.component`,
      },
    ],
  },
] as PlaintextPatch[];
