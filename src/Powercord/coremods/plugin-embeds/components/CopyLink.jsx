const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');

const Clickable = getModuleByDisplayName('Clickable', false);
const Link = getModuleByDisplayName('Link', false);
const { copyLink, copyLinkIcon, copied } = getModule([ 'titleRegion' ], false);

module.exports = function ({ url }) {
  const [ cooldown, setCooldown ] = React.useState(false);
  const timeoutRef = React.useRef();
  React.useEffect(() => () => clearTimeout(timeoutRef.current));

  function handleClick () {
    if (cooldown) {
      return;
    }

    window.DiscordNative.clipboard.copy(url);
    setCooldown(true);
    timeoutRef.current = setTimeout(() => setCooldown(false), 2000);
  }

  return (
    <Clickable className={`${copyLink}${cooldown ? ` ${copied}` : ''}`} onClick={handleClick}>
      <Link className={copyLinkIcon} href={url} target="_blank" />
      {cooldown ? Messages.REPLUGGED_PLUGIN_EMBED_COPIED : Messages.REPLUGGED_PLUGIN_EMBED_COPY}
    </Clickable>
  );
};
