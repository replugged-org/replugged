const { getModule, React } = require('powercord/webpack');
const PluginEmbed = require('./components/PluginEmbed');

const { matchRepoURL } = require('../moduleManager/util');

const SimpleMarkdown = getModule([ 'defaultRules', 'astParserFor' ], false);

let originalFn;

module.exports.injectMessages = function () {
  originalFn = SimpleMarkdown.defaultRules.link.react;
  SimpleMarkdown.defaultRules.link.react = (...args) => {
    const res = originalFn(...args);

    const match = matchRepoURL(res.props.href);
    if (match) {
      return (
        <PluginEmbed match={match} />
      );
    }

    return res;
  };
};

module.exports.uninjectMessages = function () {
  if (originalFn) {
    SimpleMarkdown.defaultRules.link.react = originalFn;
  }
};
