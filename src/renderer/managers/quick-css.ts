import { loadStyleSheet } from "../util";

let el: HTMLLinkElement | undefined;

export function load(): void {
  el = loadStyleSheet("recelled://quickcss/main.css");
}

export function unload(): void {
  el?.remove();
  el = void 0;
}

export function reload(): void {
  unload();
  load();
}
