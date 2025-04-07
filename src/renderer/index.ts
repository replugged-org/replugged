import * as replugged from "./replugged";

window.replugged = replugged;

if (window.location.hostname.includes("discord.com")) {
  replugged.ignition.ignite();
} else {
  replugged.ignition.startSplash();
}
