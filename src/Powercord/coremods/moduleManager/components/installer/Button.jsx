const { React, i18n: { Messages } } = require('powercord/webpack');
const { Clickable } = require('powercord/components');
const { cloneRepo, matchRepoURL } = require('../../util');

module.exports = class Button extends React.Component {
  render () {
    const match = matchRepoURL(this.props.message.content);
    if (!match) {
      return <></>;
    }
    const { url, repoName } = match;

    const installed = this.props.type === 'plugin'
      ? powercord.pluginManager.isInstalled(repoName)
      : powercord.styleManager.isInstalled(repoName);

    return (
      <div
        className={[ 'PluginDownloaderApply', installed && 'applied' ]
          .filter(Boolean)
          .join(' ')}
      >
        <Clickable
          onClick={() => {
            if (installed) {
              return;
            }
            cloneRepo(url, powercord, this.props.type);
          }}
        >
          {installed
            ? Messages.REPLUGGED_BUTTON_INSTALLER_INSTALLED.format({
              type: this.props.type === 'plugin' ? Messages.REPLUGGED_PLUGIN : Messages.REPLUGGED_THEME
            })
            : Messages.REPLUGGED_BUTTON_INSTALLER_DOWNLOAD.format({
              type: this.props.type === 'plugin' ? Messages.REPLUGGED_PLUGIN : Messages.REPLUGGED_THEME
            })}
        </Clickable>
      </div>
    );
  }
};
