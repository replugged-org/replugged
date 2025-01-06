import * as replugged from "./replugged";

window.replugged = replugged;

// Splash screen
if (window.location.href.endsWith("/app_bootstrap/splash/index.html")) {
  replugged.ignition.startSplash();
} else {
  replugged.ignition.ignite();
}
