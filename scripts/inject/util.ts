export const AnsiEscapes = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',
};

export const BasicMessages = {
  PLUG_FAILED: `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to plug Replugged :(${AnsiEscapes.RESET}`,
  PLUG_SUCCESS: `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}Replugged has been successfully plugged :D${AnsiEscapes.RESET}`,
  UNPLUG_FAILED: `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to unplug Replugged :(${AnsiEscapes.RESET}`,
  UNPLUG_SUCCESS: `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}Replugged has been successfully unplugged${AnsiEscapes.RESET}`,
};

export const PlatformNames = {
  stable: 'Discord',
  ptb: 'Discord PTB',
  canary: 'Discord Canary',
  dev: 'Discord Development',
};
