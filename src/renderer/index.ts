import * as replugged from "./replugged";

window.replugged = replugged;

type DiscordSplashWindow = Window & {
  DiscordSplash?: object;
};

// Splash screen
if ((window as DiscordSplashWindow).DiscordSplash) {
  await replugged.ignition.startSplash();
} else {
  await replugged.plugins.loadAll();
  await replugged.ignition.ignite();
}
