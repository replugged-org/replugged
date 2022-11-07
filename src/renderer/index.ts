import * as replugged from "./replugged";

window.replugged = replugged;

await replugged.plugins.load();
await replugged.ignition.start();
