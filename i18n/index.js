import { existsSync, readdirSync } from "fs";
import { join } from "path";

const i18nDirProd = join(__dirname, "./i18n");
const i18nDirDev = join(__dirname, "../i18n");

const i18nDir = existsSync(i18nDirProd) ? i18nDirProd : i18nDirDev;

readdirSync(i18nDir)
  .filter((file) => file.endsWith(".json"))
  .forEach((filename) => {
    const moduleName = filename.split(".")[0];
    exports[moduleName] = require(`${i18nDir}/${filename}`);
  });

export default exports;
