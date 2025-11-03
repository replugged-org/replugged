import { app } from "electron";
import { dirname, join } from "path";
import type { PackageJson } from "type-fest";

const discordPath = join(dirname(require.main!.filename), "..", "app.orig.asar");
const discordPackage: PackageJson = require(join(discordPath, "package.json"));
require.main!.filename = join(discordPath, discordPackage.main!);

type AppType = typeof app & {
  setAppPath: (path: string) => void;
};

(app as AppType).setAppPath(discordPath);
// app.name = discordPackage.name;

require("./replugged");

require(discordPath);
