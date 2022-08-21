const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');

const Clickable = getModuleByDisplayName('Clickable', false);
const { copyLink } = getModule([ 'titleRegion' ], false);
const { openURL } = getModule([ 'openURL' ], false);

module.exports = function ({ url }) {
  function handleClick () {
    openURL(url);
  }

  return (
    <Clickable className={copyLink} onClick={handleClick}>
      {Messages.REPLUGGED_PLUGIN_EMBED_VIEW_REPO}
    </Clickable>
  );
};
