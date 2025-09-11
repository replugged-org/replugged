import { app } from "electron";

import { dirname, join } from "path";
import type { PackageJson } from "type-fest";

const discordPath = join(dirname(require.main!.filename), "..", "app.orig.asar");
const discordPackage: PackageJson = require(join(discordPath, "package.json"));
require.main!.filename = join(discordPath, discordPackage.main!);

(
  app as typeof app & {
    setAppPath: (path: string) => void;
  }
).setAppPath(discordPath);
// app.name = discordPackage.name;

require("./replugged");

require(discordPath);
