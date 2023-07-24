import * as replugged from "./replugged";

window.replugged = replugged;

// Splash screen
if (document.title === "Discord Updater") {
  await replugged.ignition.startSplash();
} else {
  await replugged.plugins.loadAll();
  await replugged.ignition.ignite();
}
