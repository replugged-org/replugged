import * as replugged from "./replugged";

window.replugged = replugged;

type DiscordSplashWindow = Window & {
  DiscordSplash?: object;
};

// Splash screen
if ((window as DiscordSplashWindow).DiscordSplash) {
  replugged.ignition.startSplash();
} else {
  replugged.ignition.ignite();
}
