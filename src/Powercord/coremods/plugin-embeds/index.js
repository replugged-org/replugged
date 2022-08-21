const { uninject } = require('powercord/injector');
const { injectMessages, uninjectMessages } = require('./injectMessages');

function _init () {
  injectMessages();
}

function _shut () {
  uninjectMessages();
  uninject('pc-plugin-embeds-url-fix');
}

module.exports = function () {
  powercord.api.labs.registerExperiment({
    id: 'pc-plugin-embeds',
    name: 'Plugin Embeds',
    date: 1660469230170,
    description: 'Displays plugin embeds for GitHub links',
    callback: (enabled) => enabled ? _init() : _shut()
  });

  if (powercord.api.labs.isExperimentEnabled('pc-plugin-embeds')) {
    _init();
  }

  return () => {
    powercord.api.labs.unregisterExperiment('pc-plugin-embeds');
    _shut();
  };
};
