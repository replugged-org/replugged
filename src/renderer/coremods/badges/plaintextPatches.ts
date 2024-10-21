import type { PlaintextPatch } from "src/types";

export default [
  {
    // Edit the ProfileBadges component
    find: /\.container,\w+\),"aria-label":\w+.\w+\.Messages\.PROFILE_USER_BADGES/,
    replacements: [
      // Add the "replugged-badge" class if it's our custom badge
      {
        match: /(\w+)\.icon\),className:\w+\(\)\(\w+\.badge,\w+/,
        replace: `$&,{["replugged-badge"]:$1.component}`,
      },
      // Change to a div and add a children for our custom badge
      {
        match: /"img",({.+?\((\w+)\.icon\),)/,
        replace: `$2.component?"div":"img",$1children:$2.component,`,
      },
    ],
  },
] as PlaintextPatch[];
