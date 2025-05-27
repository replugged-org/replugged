import path, { join } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { AnsiEscapes } from "../util.mjs";
import { exitCode } from "../index.mjs";
import type { PackageJson } from "type-fest";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const rootPath = join(dirname, "..", "..", "..");
const nodeModulesPath = join(rootPath, "node_modules");

const installDeps = (): void => {
  console.log("Installing dependencies, please wait...");
  execSync("pnpm install", {
    cwd: rootPath,
    stdio: [null, null, null],
  });
  console.log("Dependencies successfully installed!");
};

// Don't clone in System32
if (dirname.toLowerCase().replace(/\\/g, "/").includes("/windows/system32")) {
  console.log(
    `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to plug Replugged :(${AnsiEscapes.RESET}`,
    "\n",
  );
  console.log(
    "Replugged detected that you are trying to install Replugged in the System32 folder.",
  );
  console.log(
    "This shouldn't be done as it will prevent Replugged from functioning as expected.",
    "\n",
  );
  console.log("This is most likely caused by you opening the command prompt as an administrator.");
  console.log(
    `Try re-opening your command prompt ${AnsiEscapes.BOLD}without${AnsiEscapes.RESET} opening it as administrator.`,
  );
  process.exit(exitCode);
}

// Verify if we're on node 10.x
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!(await import("fs")).promises) {
  console.log(
    `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to plug Replugged :(${AnsiEscapes.RESET}`,
    "\n",
  );
  console.log("Replugged detected you're running an outdated version of NodeJS.");
  console.log("You must have at least NodeJS 10 installed for Replugged to function.", "\n");
  console.log("You can download the latest version of NodeJS at https://nodejs.org");
  process.exit(exitCode);
}

// Verify if deps have been installed. If not, install them automatically
if (!existsSync(nodeModulesPath)) {
  installDeps();
} else {
  const packageJson: PackageJson = JSON.parse(
    readFileSync(join(rootPath, "package.json"), { encoding: "utf8" }),
  );
  for (const dependency in packageJson.dependencies) {
    const depPath = join(nodeModulesPath, dependency);
    if (!existsSync(depPath)) {
      installDeps();
      break;
    }

    const depPackage: PackageJson = JSON.parse(
      readFileSync(join(depPath, "package.json"), { encoding: "utf8" }),
    );
    const expectedVerInt = packageJson.dependencies[dependency]
      ? parseInt(packageJson.dependencies[dependency].replace(/[^\d]/g, ""), 10)
      : 0;
    const installedVerInt = depPackage.version
      ? parseInt(depPackage.version.replace(/[^\d]/g, ""), 10)
      : 0;
    if (installedVerInt < expectedVerInt) {
      installDeps();
      break;
    }
  }
}
