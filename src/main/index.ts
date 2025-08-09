import { dirname, join } from "path";
import type { PackageJson } from "type-fest";

const discordPath = join(dirname(require.main!.filename), "..", "app.orig.asar");
const discordPackage: PackageJson = require(join(discordPath, "package.json"));
require.main!.filename = join(discordPath, discordPackage.main!);

if (!process.argv.includes("--vanilla")) require("./replugged");
require(discordPath);
