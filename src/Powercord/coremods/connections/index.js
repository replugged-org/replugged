const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const { join } = require('path');
const { loadStyle, unloadStyle } = require('../util');

const SettingsConnections = require('./components/settings/ConnectedAccounts');
const ProfileConnections = require('./components/profile/ConnectedAccounts');

let classes = {};

/* DEBUG LOG COMMAND REMOVE B4 MERGE!!! */
function log(...data) {
  console.log(`%c[Replugged:Coremod:Connections]`, 'color: #7289da', ...data);
}

// doesn't do much, probably needs rewriting if i can't get discord to make the elements
async function patchSettingsConnections() {
  const UserSettingsConnections = await getModule(m => m.default?.displayName === 'UserSettingsConnections');
  inject('pc-connections-settings', UserSettingsConnections, 'default', (args, res) => {
    log(UserSettingsConnections, "\n", args, "\n", res)
    if (!res.props.children) {
      return res;
    }

    const connectedAccounts = res.props.children[2].props.children;
    connectedAccounts.push(React.createElement(SettingsConnections, {}));
    return res;
  });

  UserSettingsConnections.default.displayName = 'UserSettingsConnections';
}

async function patchUserConnections() {

  // User Profile Modal -> User Info section
  lazyPatchProfileModal('Passport',
    m => m?.ConnectedUserAccounts,
    Passport => {
      inject('pc-connections-profile', Passport, 'ConnectedUserAccounts', ([props]) => {

        for (const connection of powercord.api.connections.connections) {
          const account = connection.fetchAccount(props.userId);
          if (account) props.connectedAccounts.push(account);
        }

        return [props];
      }, true);
    }
  )

  // this module handles accessing Connections and users' connected Accounts
  lazyPatchProfileModal('ConnectableAccounts',
    m => m?.default?.getByUrl,
    ConnectableAccounts => {
      ConnectableAccounts = ConnectableAccounts.default;

      console.log(ConnectableAccounts);

      for (const property in ConnectableAccounts) {
        if (property === "get" || property === "isSupported" || property === "filter") continue;

        /*inject(`pc-connections-ConnectableAccounts-${property}-pre`, ConnectableAccounts, property, (e) => {
          log(`${property}-pre`, e);
          return [e];
        }, true);*/

        inject(`pc-connections-ConnectableAccounts-${property}`, ConnectableAccounts, property, ([e], f) => {
          if (e === "spotify") return f;
          log(property, e, f);
          return f;
        }, false);
      }

      // filter must insert all connections (the filtering has already happened)
      inject("pc-connections-ConnectableAccounts-filter", ConnectableAccounts, "filter", ([filter], connectionsArray) => {
        connectionsArray = connectionsArray.concat(powercord.api.connections.connections)
        console.log(connectionsArray)
        return connectionsArray;
      });


      // must return true for ConnectableAccounts.get to be called
      inject("pc-connections-ConnectableAccounts-isSupported", ConnectableAccounts, "isSupported",
        ([type], supported) => supported || powercord.api.connections.get(type) !== null
      );


      // TODO: why is the account appearing multiple times now????
      console.log(ConnectableAccounts.get, typeof ConnectableAccounts.get)
      console.log(ConnectableAccounts.get.__powercordOriginal_get, typeof ConnectableAccounts.get.__powercordOriginal_get)

      // have to overwrite get to prevent the original from being called, as it crashes w/ unknown connection types
      if (typeof ConnectableAccounts.get.__powercordOriginal_get === "undefined") {
        console.log("overwriting ConnectableAccounts.get")
        const originalGet = ConnectableAccounts.get

        ConnectableAccounts.get = (type) => powercord.api.connections.get(type) ?? originalGet(type)

        /*ConnectableAccounts.get = (type) => {
          if (type !== "spotify") console.log(ConnectableAccounts.get, typeof ConnectableAccounts.get)
          if (type !== "spotify") console.log(ConnectableAccounts.get.__powercordOriginal_get, typeof ConnectableAccounts.get.__powercordOriginal_get)
          let ret = powercord.api.connections.get(type) ?? originalGet(type)

          // convert old icon format to what discord's looking for
          /*if (ret.icon.color) {
            if (ret.icon.color.endsWith('.png')) {
              ret.icon.darkPNG = ret.icon.color;
              ret.icon.lightPNG = ret.icon.color;
              ret.icon.whitePNG = ret.icon.color;
            }
            if (ret.icon.color.endsWith('.svg')) {
              ret.icon.darkSVG = ret.icon.color;
              ret.icon.lightSVG = ret.icon.color;
              ret.icon.whiteSVG = ret.icon.color;
            }
          }*/
        //debug
        /*  if (type !== "spotify") console.log(ret)

          return ret;
        }*/

        ConnectableAccounts.get.__powercordOriginal_get = originalGet
      }
    }
  );
}

module.exports = async () => {
  classes = {
    ...await getModule(['userInfoSection']),
    ...await getModule(['modal', 'inner']),
    ...await getModule(['connectedAccount'])
  };

  log("Patching stuff")
  const styleId = loadStyle(join(__dirname, 'style.css'));
  patchSettingsConnections();
  patchUserConnections();
  log("Patching complete")

  return () => {
    unloadStyle(styleId);
    uninject('pc-connections-settings');
    uninject('pc-connections-profile');
  };
};


async function lazyPatchProfileModal(id, filter, patch) {
  const m = getModule(filter, false)
  if (m) patch(m)
  else {
    const { useModalsStore } = await getModule(['useModalsStore'])
    inject(`pc-connections-lazy-modal-${id}`, useModalsStore, 'setState', a => {
      const og = a[0]
      a[0] = (...args) => {
        const ret = og(...args)
        try {
          if (ret?.default?.length) {
            const el = ret.default[0]
            if (el && el.render && el.render.toString().indexOf(',friendToken:') !== -1) {
              uninject(`pc-connections-lazy-modal-${id}`)
              patch(getModule(filter, false))
            }
          }
        } catch (e) {
          this.error(e)
        }
        return ret
      }
      return a
    }, true)
  }
}