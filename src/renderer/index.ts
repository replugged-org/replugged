import * as recelled from "./recelled";

window.replugged = recelled;
window.recelled = recelled;

// Splash screen
if (window.location.href.endsWith("/app_bootstrap/splash/index.html")) {
  recelled.ignition.startSplash();
} else {
  recelled.ignition.ignite();
}
