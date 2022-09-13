const { getModule, React } = require('powercord/webpack');
const PluginEmbed = require('./components/PluginEmbed');

const { matchRepoURL, isInstallerURL } = require('../moduleManager/util');

const SimpleMarkdown = getModule([ 'defaultRules', 'astParserFor' ], false);

let originalFn;

module.exports.injectMessages = function () {
  originalFn = SimpleMarkdown.defaultRules.link.react;
  SimpleMarkdown.defaultRules.link.react = (...args) => {
    const res = originalFn(...args);

    if (!res?.props?.href) {
      return res;
    }
    const match = matchRepoURL(res.props.href);
    if (match) {
      if (res.props.title !== res.props.href) { // Named link, should only trigger if it's an installer link
        if (!isInstallerURL(res.props.href)) {
          return res;
        }
      }
      return (
        <PluginEmbed match={match} props={res.props} />
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
