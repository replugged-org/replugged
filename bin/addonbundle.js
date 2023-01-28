#!/usr/bin/env node

const asar = require("@electron/asar");
const { copyFileSync, existsSync, mkdirSync, readFileSync } = require("fs");

const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf-8"));
const outputName = `bundle/${manifest.id}.asar`;

if (!existsSync("bundle")) {
  mkdirSync("bundle");
}
asar.createPackage("dist", outputName);
copyFileSync("dist/manifest.json", `${outputName}.json`);
