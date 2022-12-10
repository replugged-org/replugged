import * as replugged from "./replugged";

window.replugged = replugged;

(async () => {
  await replugged.plugins.loadAll();
  await replugged.ignition.ignite();
})();
