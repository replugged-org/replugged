import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { exitCode } from "../index.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const tryToElevate = (command: string): void => {
  const args = [
    ...command.split(" "),
    path.join(dirname, "..", "..", "..", "node_modules", ".bin", "tsx"),
    ...process.argv.slice(1),
  ];
  const { error } = spawnSync("env", args, { stdio: "inherit" });
  if (!error) {
    process.exit(0);
  } else if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
    console.error(error);
    process.exit(exitCode);
  }
};

// It seems `sudo npm ...` no longer gives the script sudo perms in npm v7, so here we are.
if (process.platform === "linux" && process.getuid!() !== 0) {
  tryToElevate("sudo");
  tryToElevate("doas");

  console.warn("Neither doas nor sudo were found. Falling back to su.");
  console.log("Please enter your root password");
  tryToElevate("su -c");
  process.exit(0);
}
