import * as replugged from "./replugged";

// TypeScript decided to complain about this for some reason and the error made no sense.
// "Type 'new () => Injector' is not assignable to type 'new () => Injector'."
// Anyway, just gonna ignore it for now.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
window.replugged = replugged;

await replugged.plugins.loadAll();
await replugged.ignition.ignite();
