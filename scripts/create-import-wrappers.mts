import { writeFileSync } from "node:fs";
import { basename, join } from "node:path";

type LocationsRegistry =
  | string[]
  | {
      [x: string]: LocationsRegistry;
    };

const locations = {
  renderer: {
    modules: ["logger", "webpack", "i18n", "injector", "common", "components"],
    apis: ["commands", "notices", "settings"],
    util: ["."],
  },
  types: ["."],
};

function createWrappers(currentPath: string[], subpaths: LocationsRegistry): void {
  if (Array.isArray(subpaths)) {
    for (const subpath of subpaths) {
      const fullPath = join(...currentPath, subpath);
      const dtsContents = `export * from "./${fullPath}";`;
      writeFileSync(`${basename(fullPath)}.d.ts`, dtsContents);
    }
  } else {
    for (const subpath in subpaths) {
      currentPath.push(subpath);
      createWrappers(currentPath, subpaths[subpath]);
      currentPath.pop();
    }
  }
}

createWrappers(["./dist"], locations);
