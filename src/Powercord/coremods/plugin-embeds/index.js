const { uninject } = require('powercord/injector');
const injectMessages = require('./injectMessages');

module.exports = function () {
  injectMessages();
  return function () {
    uninject('pc-plugin-embeds');
    uninject('pc-plugin-embeds-url-fix');
  };
};
