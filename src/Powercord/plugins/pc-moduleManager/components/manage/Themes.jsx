const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');

const ThemeSettings = require('./ThemeSettings');
const Base = require('./Base');
const InstalledProduct = require('../parts/InstalledProduct');

class Themes extends Base {
  constructor () {
    super();
    this.state = {
      ...this.state,
      tryBeta: false
    };

    // this.state.settings = 'Customa-Discord';
  }

  render () {
    if (this.state.settings) {
      return (
        <ThemeSettings theme={this.state.settings} onClose={() => this.setState({ settings: null })}/>
      );
    }

    return super.render();
  }

  renderItem (item) {
    return (
      <InstalledProduct
        product={item.manifest}
        isEnabled={powercord.styleManager.isEnabled(item.entityID)}
        onToggle={async v => {
          await this._toggle(item.entityID, v);
          this.forceUpdate();
        }}
        Path={item.entityPath}
        onUninstall={() => this._uninstall(item.entityID)}
      />
    );
  }

  _toggle (themeID, enabled) {
    if (!enabled) {
      powercord.styleManager.disable(themeID);
    } else {
      powercord.styleManager.enable(themeID);
    }
  }

  fetchMissing () { // @todo: better impl + i18n
    // noinspection JSIgnoredPromiseFromCall
    powercord.pluginManager.get('pc-moduleManager')._fetchEntities('themes');
  }

  getItems () {
    return this._sortItems([ ...powercord.styleManager.themes.values() ]);
  }

  _uninstall (themeID) {
    const themes = [ themeID ];
    openModal(() => (
      <Confirm
        red
        header={Messages.REPLUGGED_THEMES_UNINSTALL}
        confirmText={Messages.REPLUGGED_THEMES_UNINSTALL}
        cancelText={Messages.CANCEL}
        onCancel={closeModal}
        onConfirm={async () => {
          for (const theme of themes) {
            try {
              await powercord.styleManager.uninstall(theme);
            } catch (err) {
              console.error(err);
            }
          }
          closeModal();
          this.forceUpdate();
        }}
      >
        <div className='powercord-products-modal'>
          <span>{Messages.REPLUGGED_THEMES_UNINSTALL_SURE}</span>
          <ul>
            {themes.map(p => <li key={p}>{powercord.styleManager.get(p)?.manifest?.name}</li>)}
          </ul>
        </div>
      </Confirm>
    ));
  }
}

module.exports = Themes;
