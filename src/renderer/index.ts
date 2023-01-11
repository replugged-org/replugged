import * as replugged from "./replugged";

window.replugged = replugged;

await replugged.plugins.loadAll();
await replugged.ignition.ignite();
