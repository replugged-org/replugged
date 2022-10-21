import { spawnSync } from "child_process";
import path from "path";

const argv = [
  path.join(__dirname, "..", "..", "..", "node_modules", ".bin", "tsx"),
  ...process.argv.slice(1),
];

const tryToElevate = (command: string): void => {
  const { error } = spawnSync(command, argv, { stdio: "inherit" });
  if (!error) {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  } else if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
    console.error(error);
    // eslint-disable-next-line no-process-exit
    process.exit(argv.includes("--no-exit-codes") ? 0 : 1);
  }
};

// It seems `sudo npm ...` no longer gives the script sudo perms in npm v7, so here we are.
if (process.platform === "linux" && process.getuid!() !== 0) {
  tryToElevate("sudo");
  tryToElevate("doas");

  console.warn("Neither doas nor sudo were found. Falling back to su.");
  console.log("Please enter your root password");
  spawnSync("su", ["-c", argv.join(" ")], { stdio: "inherit" });
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}
