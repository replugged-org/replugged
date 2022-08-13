const { getModule, React } = require('powercord/webpack');
const PluginEmbed = require('./components/PluginEmbed');

const regex = /^https?:\/\/(?:www\.)?github\.com\/([^/\s>]+)\/([^/\s>]+)(?:\/tree\/([^\s>]+))?/;

module.exports = function () {
  const SimpleMarkdown = getModule([ 'defaultRules', 'astParserFor' ], false);
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
