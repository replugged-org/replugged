import { loadStyleSheet } from "../util";

let el: HTMLLinkElement | undefined;

export function load(): void {
  el?.remove();
  el = loadStyleSheet("replugged://quickcss/main.css");
}

export function unload(): void {
  el?.remove();
  el = void 0;
}

export function reload(): void {
  unload();
  load();
}
