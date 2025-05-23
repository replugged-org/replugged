// WARNING: any imported files need to be added to files in package.json

import chalk from "chalk";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import prompts from "prompts";
import semver from "semver";
import type { AnyAddonManifest } from "src/types";
import { isMonoRepo, selectAddon } from "./mono.mjs";

/**
 * Prompt a confirmation message and exit if the user does not confirm.
 */
async function confirmOrExit(message: string, initial = false): Promise<void> {
  const { doContinue } = await prompts(
    {
      type: "confirm",
      name: "doContinue",
      message: chalk.yellow(message),
      initial,
    },
    { onCancel },
  );

  if (!doContinue) {
    console.log(chalk.red("Aborting"));
    process.exit(0);
  }
}

/**
 * Run a command and return the output.
 */
function runCommand(command: string, exit = true): string {
  try {
    const result = execSync(command, {
      encoding: "utf8",
      cwd: getRootDir(),
    });
    return result;
  } catch (error) {
    // @ts-expect-error not unknown
    if (!exit) return error.stdout;
    // @ts-expect-error not unknown
    console.error(error.message);
    process.exit(1);
  }
}

export function onCancel(): void {
  console.log(chalk.red("Aborting"));
  process.exit(128); // SIGINT
}

let root: string;

function getRootDir(): string {
  if (root) return root;

  try {
    root = execSync("git rev-parse --show-toplevel", {
      encoding: "utf8",
      cwd: process.cwd(),
    }).trim();
    return root;
  } catch (error) {
    // @ts-expect-error not unknown
    if (error.message.includes("not a git repository")) {
      console.log(chalk.red("You must run this command from within a git repository"));
      process.exit(1);
    }

    // @ts-expect-error not unknown
    console.error(`Command failed with exit code ${error.status}: ${error.message}`);
    process.exit(1);
  }

  throw new Error("Unreachable");
}

export async function release(): Promise<void> {
  const directory = getRootDir();

  const status = runCommand("git status --porcelain");
  const isClean = !status.trim();
  if (!isClean) await confirmOrExit("Working directory is not clean. Continue?");

  const addon = isMonoRepo ? await selectAddon("all") : null;
  const manifestPath = addon
    ? path.resolve(directory, addon.type, addon.name, "manifest.json")
    : path.resolve(directory, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.log(chalk.red("manifest.json not found"));
    process.exit(1);
  }
  const manifestText = readFileSync(manifestPath, "utf8");
  let manifest: AnyAddonManifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    console.log(chalk.red("manifest.json is not valid JSON"));
    process.exit(1);
  }

  const packagePath = addon ? null : path.resolve(directory, "package.json");
  if (!isMonoRepo && !existsSync(packagePath!)) {
    console.log(chalk.red("package.json not found"));
    process.exit(1);
  }
  const packageText = packagePath ? readFileSync(packagePath, "utf8") : null;
  let packageJson;
  try {
    packageJson = packagePath ? JSON.parse(packageText!) : null;
  } catch {
    console.log(chalk.red("package.json is not valid JSON"));
    process.exit(1);
  }

  // Prompt for version

  const { version } = manifest;
  let nextVersion: string | null = null;

  const isValidSemver = Boolean(semver.valid(version));
  if (isValidSemver) {
    const nextPatch = semver.inc(version, "patch");
    const nextMinor = semver.inc(version, "minor");
    const nextMajor = semver.inc(version, "major");

    ({ nextVersion } = await prompts(
      {
        type: "select",
        name: "nextVersion",
        message: "Version",
        choices: [
          {
            title: `Patch: v${nextPatch}`,
            value: nextPatch,
          },
          {
            title: `Minor: v${nextMinor}`,
            value: nextMinor,
          },
          {
            title: `Major: v${nextMajor}`,
            value: nextMajor,
          },
          {
            title: "Custom",
            value: null,
          },
        ],
      },
      { onCancel },
    ));
  }
  if (!nextVersion) {
    ({ nextVersion } = await prompts(
      {
        type: "text",
        name: "nextVersion",
        message: isValidSemver ? "Custom Version" : "Version",
        validate: (value) => {
          if (!value.trim()) return "Version is required";

          return true;
        },
      },
      { onCancel },
    ));
  }

  nextVersion = nextVersion?.trim() ?? "";
  const isNewValidSemver = Boolean(semver.valid(nextVersion));
  if (isValidSemver) {
    // If the existing version is not semver, don't bother with semver checks
    if (isNewValidSemver) {
      if (semver.lte(nextVersion, version)) {
        await confirmOrExit(`Version ${nextVersion} is not greater than ${version}. Continue?`);
      }
      const cleaned = semver.clean(nextVersion);
      if (cleaned !== nextVersion) {
        const { clean } = await prompts({
          type: "confirm",
          name: "clean",
          message: `Convert ${nextVersion} to cleaned version ${cleaned}?`,
          initial: true,
        });
        if (clean) nextVersion = cleaned;
      }
    } else {
      await confirmOrExit(`Version ${nextVersion} is not a valid semver. Continue?`);
    }
  }

  // Update manifest.json and package.json
  manifest.version = nextVersion!;
  if (packageJson) packageJson.version = nextVersion;

  // Write manifest.json and package.json (indent with 2 spaces and keep trailing newline)
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  if (packageJson) writeFileSync(packagePath!, `${JSON.stringify(packageJson, null, 2)}\n`);

  // Stage changes
  if (isMonoRepo) runCommand(`git add ${path.join(addon!.type, addon!.name, "manifest.json")}`);
  else runCommand("git add manifest.json package.json");

  // Commit changes
  const { message } = await prompts(
    {
      type: "text",
      name: "message",
      message: "Commit message",
      initial: isMonoRepo
        ? `[${manifest.name}] Release v${nextVersion}`
        : `Release v${nextVersion}`,
      validate: (value) => {
        if (!value.trim()) return "Commit message is required";

        return true;
      },
    },
    { onCancel },
  );

  // Pick tag name
  const existingTags = runCommand("git tag --list").split("\n").filter(Boolean);

  const { tagName } = await prompts(
    {
      type: "text",
      name: "tagName",
      message: "Tag name",
      initial: isMonoRepo
        ? `v${nextVersion}-${manifest.name.replace(" ", "_")}`
        : `v${nextVersion}`,
      validate: (value: string) => {
        if (!value.trim()) return "Tag name is required";

        if (existingTags.includes(value)) return `Tag ${value} already exists`;

        return true;
      },
    },
    { onCancel },
  );

  const hasSigningKey = Boolean(runCommand("git config --get user.signingkey", false).trim());
  const commitSigningEnabled =
    runCommand("git config --get commit.gpgsign", false).trim() === "true";
  const tagSigningEnabled = runCommand("git config --get tag.gpgsign", false).trim() === "true";

  let sign = false;
  if (hasSigningKey && (!commitSigningEnabled || !tagSigningEnabled)) {
    ({ sign } = await prompts({
      type: "confirm",
      name: "sign",
      message: "Sign commit and tag?",
      initial: true,
    }));
  }

  // Commit changes
  runCommand(`git commit${sign ? " -S" : ""} -m "${message}"`);

  // Tag commit
  runCommand(`git tag${sign ? " -s" : ""} -a -m "${message}" "${tagName}"`);

  // Push changes
  await confirmOrExit("Push changes to remote?", true);

  runCommand("git push");

  // And the tag
  runCommand("git push --tags");
}
