const { getModule, React } = require('powercord/webpack');
const { inject } = require('powercord/injector');
const PluginEmbed = require('./components/PluginEmbed');

const regex = /https?:\/\/(?:www\.)?github\.com\/([^/\s>]+)\/([^/\s>]+)(?:\/tree\/([^\s>]+))?/;

module.exports = function () {
  const SimpleMarkdown = getModule([ 'defaultRules', 'astParserFor' ], false);
  inject('pc-plugin-embeds', SimpleMarkdown.defaultRules.link, 'react', (args, ret) => {
    if (!regex.test(args[0].target)) {
      return ret;
    }
    if (!args[0].target.endsWith('/')) {
      args[0].target += '/';
    }

    return (
      <PluginEmbed url={args[0].target} match={regex.exec(args[0].target)} />
    );
  });
};
