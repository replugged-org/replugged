const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');
const { CORE_PLUGINS } = require('powercord/constants');

const InstalledProduct = require('../parts/InstalledProduct');
const Base = require('./Base');


class Plugins extends Base {
  renderItem (item) {
    return (
      <InstalledProduct
        product={item.manifest}
        isEnabled={powercord.pluginManager.isEnabled(item.entityID)}
        onToggle={async v => {
          await this._toggle(item.entityID, v);
          this.forceUpdate();
        }}
        Path={item.entityPath}
        onUninstall={() => this._uninstall(item.entityID)}
      />
    );
  }

  getItems () {
    const plugins = Array.from(powercord.pluginManager.plugins.values()).filter((p) => !CORE_PLUGINS.includes(p.entityID));
    return this._sortItems(plugins);
  }

  fetchMissing () { // @todo: better impl + i18n
    // noinspection JSIgnoredPromiseFromCall
    powercord.pluginManager.get('pc-moduleManager')._fetchEntities('plugins');
  }

  _toggle (pluginID, enabled) {
    let fn;
    let plugins;
    if (enabled) {
      plugins = [ pluginID ].concat(powercord.pluginManager.get(pluginID).dependencies);
      fn = powercord.pluginManager.enable.bind(powercord.pluginManager);
    } else {
      plugins = [ pluginID ].concat(powercord.pluginManager.get(pluginID).dependents);
      fn = powercord.pluginManager.disable.bind(powercord.pluginManager);
    }

    const apply = async () => {
      for (const plugin of plugins) {
        await fn(plugin);
      }
    };

    if (plugins.length === 1) {
      return apply();
    }

    const title = enabled
      ? Messages.REPLUGGED_PLUGINS_ENABLE
      : Messages.REPLUGGED_PLUGINS_DISABLE;
    const note = enabled
      ? Messages.REPLUGGED_PLUGINS_ENABLE_NOTE
      : Messages.REPLUGGED_PLUGINS_DISABLE_NOTE;
    openModal(() => (
      <Confirm
        red={!enabled}
        header={title}
        confirmText={title}
        cancelText={Messages.CANCEL}
        onConfirm={async () => {
          await apply();
          this.forceUpdate();
          closeModal();
        }}
        onCancel={closeModal}
      >
        <div className='powercord-products-modal'>
          <span>{note}</span>
          <ul>
            {plugins.map(p => <li key={p.id}>{powercord.pluginManager.get(p).manifest.name}</li>)}
          </ul>
        </div>
      </Confirm>
    ));
  }

  _uninstall (pluginID) {
    const plugins = [ pluginID ].concat(powercord.pluginManager.get(pluginID).dependents);
    openModal(() => (
      <Confirm
        red
        header={Messages.REPLUGGED_PLUGINS_UNINSTALL.format({ pluginCount: plugins.length })}
        confirmText={Messages.REPLUGGED_PLUGINS_UNINSTALL.format({ pluginCount: plugins.length })}
        cancelText={Messages.CANCEL}
        onCancel={closeModal}
        onConfirm={async () => {
          for (const plugin of plugins) {
            try {
              await powercord.pluginManager.uninstall(plugin);
            } catch (err) {
              console.error(err);
            }
          }
          closeModal();
          this.forceUpdate();
        }}
      >
        <div className='powercord-products-modal'>
          <span>{Messages.REPLUGGED_PLUGINS_UNINSTALL_SURE.format({ pluginCount: plugins.length })}</span>
          <ul>
            {plugins.map(p => <li key={p.id}>{powercord.pluginManager.get(p)?.manifest?.name}</li>)}
          </ul>
        </div>
      </Confirm>
    ));
  }
}

module.exports = Plugins;
