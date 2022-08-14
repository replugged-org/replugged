const { getModule, React } = require('powercord/webpack');
const PluginEmbed = require('./components/PluginEmbed');

const SimpleMarkdown = getModule([ 'defaultRules', 'astParserFor' ], false);
const regex = /^https?:\/\/(?:www\.)?github\.com\/([^/\s>]+)\/([^/\s>]+)(?:\/tree\/([^\s>]+))?/;

module.exports.injectMessages = function () {
  SimpleMarkdown.defaultRules.pluginLink = {
    order: SimpleMarkdown.defaultRules.url.order - 0.5,
    match (source) {
      return regex.exec(source);
    },
    parse (capture) {
      if (!capture.input.endsWith('/')) {
        capture.input += '/';
      }
      return {
        match: capture,
        url: capture.input
      };
    },
    react (node) {
      return (
        <PluginEmbed url={node.url} match={node.match} />
      );
    }
  };
};

module.exports.uninjectMessages = function () {
  delete SimpleMarkdown.defaultRules.pluginLink;
};
