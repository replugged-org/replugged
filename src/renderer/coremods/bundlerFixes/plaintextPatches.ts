import type { PlaintextPatch } from "src/types";

export default [
  // Force require the lazy loaded highlight.js module
  {
    find: 'location:"MarkupReactRules"',
    replacements: [
      {
        match:
          /function \i\(\i\)\{.*?let \i=\{.*?"MarkupReactRules".*?createPromise:\(\)=>Promise\.all\(\[.*?\]\)\.then\(\i\.\i\(\i,\d+\)\).*?webpackId:(\d+)/,
        replace: "replugged.webpack.wpRequire($1);$&",
      },
    ],
  },
] as PlaintextPatch[];
