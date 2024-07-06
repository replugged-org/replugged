import type { PlaintextPatch } from "src/types";

export default [
  {
    // Edit the UserProfileBadgeList component
    find: ".profileBadge2",
    replacements: [
      {
        // Add the "replugged-badge" class if it's our custom badge
        match: /src:(\w+)\.src,className:\w+\(\)\({/,
        replace: `$&["replugged-badge"]:$1.component,`,
      },
      {
        // Change to a div and add a children for our custom badge
        match: /"img",({.+?src:(\w+)\.src,)/,
        replace: `$2.component?"div":"img",$1children:$2.component,`,
      },
    ],
  },
  {
    // Edit the ProfileBadges component (new profile design)
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
