import * as replugged from "./replugged";

window.replugged = replugged;

const allowedHosts = ["discord.com", "discordapp.com"];
if (allowedHosts.some((host) => window.location.hostname.endsWith(host))) {
  replugged.ignition.ignite();
} else {
  replugged.ignition.startSplash();
}
