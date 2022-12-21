/*
Plaintext patch version of this coremod:

{
  find: "setDevtoolsCallbacks",
  replacements: [
    {
      match: /if\(.{0,10}\|\|"0.0.0"!==.{0,2}\.remoteApp\.getVersion\(\)\)/,
      replace: "if(false)"
    }
  ]
}
*/

export function start(): void {
  DiscordNative.window.setDevtoolsCallbacks(null, null);
}
