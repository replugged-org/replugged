import { readdirSync } from "fs";
import { join } from "path";

const i18nDir = join(__dirname, "../i18n");

readdirSync(i18nDir)
  .filter((file) => file.endsWith(".json"))
  .forEach((filename) => {
    const moduleName = filename.split(".")[0];
    exports[moduleName] = require(`${i18nDir}/${filename}`);
  });

export default exports;
