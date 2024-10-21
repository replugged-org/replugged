import * as replugged from "./replugged";

window.replugged = replugged;

type DiscordSplashWindow = Window & {
  DiscordSplash?: object;
};

// Splash screen
if ((window as DiscordSplashWindow).DiscordSplash) {
  void replugged.ignition.startSplash();
} else {
  void replugged.ignition.ignite();
}
