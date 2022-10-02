import * as webpack from './modules/webpack';
import * as notices from './apis/notices';
import * as commands from './apis/commands';

export const replugged = {
  webpack,
  notices,
  commands
};

window.replugged = replugged;
