import * as replugged from './replugged';

window.replugged = replugged;

(async () => {
  await replugged.plugins.load();
  await replugged.ingition.start();
})();
