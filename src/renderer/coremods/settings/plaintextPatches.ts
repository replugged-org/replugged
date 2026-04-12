import type { PlaintextPatch } from "src/types";

export default [
  {
    find: '"$Root"',
    replacements: [
      {
        // Patch the root layout to insert our nodes
        match: /(\i)\.buildLayout\(\)/,
        replace: (layout, root) => `($exports?._insertNodes?.(${root})??${layout})`,
      },
    ],
  },
  {
    find: ".push(`Build Override: ",
    replacements: [
      {
        // Add our version info to the settings footer
        match: /\i,children:.{30,60}\("span",{children:\[" \(",\i,"\)"\]}\)\]}\)/,
        replace: (prefix) => `${prefix},$exports?._renderVersionInfo() ?? null`,
      },
      {
        // Patch the copy value to include our version info
        match: /copyValue:(\i)\.join\(" "\)/,
        replace: (_, copyValues) =>
          `copyValue:[...${copyValues},$exports?._getVersionString()].join(" ")`,
      },
    ],
  },
  {
    find: /"data-nav-anchor-key":\i\.key,/,
    replacements: [
      {
        // Skip rendering the nested panel node components, to add breadcrumb navigation support for plugin/theme settings
        match: /\.useRef\(null\);/,
        replace: `$&if(arguments[0]?.node?.key?.startsWith("rp_")&&arguments[0]?.node?.key?.includes("_nested_panel_"))return;`,
      },
    ],
  },
] as PlaintextPatch[];
