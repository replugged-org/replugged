import { spawnSync } from "child_process";
import path from "path";

const tryToElevate = (command: string): void => {
  const args = [
    ...command.split(" "),
    path.join(__dirname, "..", "..", "..", "node_modules", ".bin", "tsx"),
    ...process.argv.slice(1),
    `--home="${process.env.HOME}"`,
    `--xdg-data-home="${process.env.XDG_DATA_HOME}"`,
  ];
  const { error } = spawnSync("env", args, { stdio: "inherit" });
  if (!error) {
    process.exit(0);
  } else if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
    console.error(error);
    process.exit(args.includes("--no-exit-codes") ? 0 : 1);
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
