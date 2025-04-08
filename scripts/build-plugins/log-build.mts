import chalk from "chalk";
import type esbuild from "esbuild";
import path from "path";

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0b";

  const k = 1024;
  const dm = 1;
  const sizes = ["b", "kb", "mb", "gb"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
};

export default {
  name: "logBuild",
  setup: (build) => {
    let start: number;

    build.onStart(() => {
      start = Date.now();
    });
    build.onEnd((result) => {
      const time = Date.now() - start;
      const files = result.metafile?.outputs || {};

      const fileData = Object.entries(files)
        .sort(([a], [b]) => {
          const aIsMap = a.endsWith(".map");
          const bIsMap = b.endsWith(".map");
          if (aIsMap && !bIsMap) return 1;
          if (!aIsMap && bIsMap) return -1;

          return 0;
        })
        .map(([file, { bytes }]) => {
          const dirname = path.dirname(file);
          const basename = path.basename(file);

          const coloredName = [dirname, path.sep, chalk.bold(basename)].join("");

          const sizeText = formatBytes(bytes);
          const isBigFile = bytes > Math.pow(1024, 2) && !file.endsWith(".map"); // 1mb
          const coloredSize = isBigFile ? chalk.yellow(sizeText) : chalk.cyan(sizeText);
          const suffix = isBigFile ? chalk.yellow(" ⚠️") : "";

          return {
            name: coloredName,
            size: coloredSize,
            suffix,
          };
        });
      const maxNameLength = Math.max(...fileData.map(({ name }) => name.length));
      const maxSizeLength = Math.max(...fileData.map(({ size }) => size.length));

      console.log("");
      fileData.forEach(({ name, size, suffix }) => {
        console.log(`  ${name.padEnd(maxNameLength + 1)} ${size.padStart(maxSizeLength)}${suffix}`);
      });
      console.log("");

      console.log(`⚡ ${chalk.green(`Done in ${time.toLocaleString()}ms`)}`);
    });
  },
} as esbuild.Plugin;
