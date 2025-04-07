import * as replugged from "./replugged";

window.replugged = replugged;

const allowedHost = "discord.com";
const { hostname } = new URL(window.location.href);
if (hostname === allowedHost || hostname.endsWith(`.${allowedHost}`)) {
  replugged.ignition.ignite();
} else {
  replugged.ignition.startSplash();
}
