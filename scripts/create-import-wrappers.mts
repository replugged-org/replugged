import { writeFileSync } from "node:fs";

const locations = {
  modules: ["logger", "webpack", "i18n", "injector", "common", "components"],
  apis: ["commands", "notices", "settings"],
  util: ["util"],
};

for (const [category, names] of Object.entries(locations)) {
  for (const name of names) {
    const path = `./dist/renderer/${category}/${name}`;
    const dtsContents = `export * from "${path}";`;
    writeFileSync(`${name}.d.ts`, dtsContents);
  }
}
