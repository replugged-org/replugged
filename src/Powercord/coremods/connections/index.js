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

async function patchSettingsConnections() {
  console.group("patchSettingsConnections")

  const ConnectAccountButton = await getModule(m => m?.default?.displayName === "ConnectAccountButton");

  // set the behavior of the connect account button (discord checks for an onConnect function)
  inject("pc-connections-settings", ConnectAccountButton, 'default', ([props]) => {
    console.group("pc-connections-settings")
    console.log("b4:", props)

    if (powercord.api.connections.some(c => c.type === props.type)) {
      // this is a powercord connection, add the onConnect funciton
      const connection = powercord.api.connections.get(props.type);
      props.onConnect = connection.onConnect;
    }

    console.log("a5ter:", props)
    console.groupEnd()
    return [props]
  }, true);

  console.groupEnd()
}

async function patchConnectedAccountsStore() {
  console.group("patchConnectedAccountsStore")

  const ConnectedAccountsStore = await getModule(m => m.__proto__?.getLocalAccounts);
  const currentUser = (await getModule(["getCurrentUser"])).getCurrentUser();

  console.log(ConnectedAccountsStore)

  // return all of this user's plugin connections from the ConnectedAccountsStore
  inject("pc-connections-ConnectedAccountsStore-getAccounts", ConnectedAccountsStore.__proto__, 'getAccounts', (_, connectedAccounts) => {
    console.group("pc-connections-ConnectedAccountsStore-getAccounts")

    console.log("%cconnectedAccounts b4:", 'color:limegreen')
    console.log(connectedAccounts);

    for (const { type } of powercord.api.connections.connections) {
      if (connectedAccounts.some(a => a.type === type)) continue;

      let account = fetchAccount(type, currentUser.id);
      if (account) {
        account = {
          ...account,
          integrations: [],
          visibility: 1
        }

        connectedAccounts.push(account);
      }
    }

    console.log("a5ter:", connectedAccounts);

    console.groupEnd();
    return connectedAccounts;
  });

  console.groupEnd()
}

async function patchConnectionsManager() {
  console.group("patchConnectionsManager")
  const ConnectionsManager = (await getModule(m => m?.default?.completeTwoWayLink)).default;
  console.log(ConnectionsManager)

  // overwrite the behavior of the disconnect account modal
  inject("pc-connections-ConnectionsManager-disconnect-pre", ConnectionsManager, 'disconnect', (args) => {
    console.group("pc-connections-ConnectionsManager-disconnect-pre")
    console.log(args)
    const [type] = args;

    if (powercord.api.connections.some(c => c.type === type)) {
      // this is a powercord connection, overwrite the onDisconnect behavior
      const connection = powercord.api.connections.get(type);
      connection.onDisconnect?.(); // call method if it exists, otherwise do nothing

      console.groupEnd()
      return false; // don't run the original function
    }

    console.groupEnd()
    return args
  }, true);

  // overwrite the behavior of the account visibility switch
  inject("pc-connections-ConnectionsManager-setVisibility-pre", ConnectionsManager, 'setVisibility', (args) => {
    console.group("pc-connections-ConnectionsManager-setVisibility-pre");

    [type, _, visible] = args;
    console.log(type, visible)

    if (powercord.api.connections.some(c => c.type === type)) {
      // this is a powercord connection, overwrite the setVisibility behavior
      const connection = powercord.api.connections.get(type);
      connection.setVisibility?.(visible === 1); // call method if it exists, otherwise do nothing

      console.groupEnd()
      return false; // don't run the original function
    }

    console.groupEnd()
    return args
  }, true);

  console.groupEnd()
}

// [userId][type] -> {account}, "pending", or undefined
const _accountCache = {};

function fetchAccount(type, userId) {
  console.group("pc-connections-fetchAccount")
  console.log("requested account:", type, userId)

  let account = _accountCache[userId]?.[type];
  console.log("account:", account)

  // if we have a fetched account, return it
  if (account && account !== "pending") {
    console.log("returing account:", account)
    console.groupEnd()
    return account
  }

  // otherwise, if the value is empty we should start fetching it
  else if (!account) {
    console.log("fetching account:", type, userId)

    _accountCache[userId] ??= {}; // ensure we have an object for this user's accounts
    _accountCache[userId][type] = "pending";

    const connection = powercord.api.connections.get(type)
    connection.fetchAccount(userId).then(account => {
      _accountCache[userId][type] = account;
      console.log("finished fetching account:", type, userId, _accountCache[userId][type]);
    })
  }

  console.groupEnd()
}

async function patchUserConnections() {

  // User Profile Modal -> User Info section
  lazyPatchProfileModal('Passport',
    m => m?.ConnectedUserAccounts,
    Passport => {
      inject('pc-connections-profile', Passport, 'ConnectedUserAccounts', ([props]) => {
        console.group("pc-connections-profile")
        console.log("b4:", props)

        for (const { type } of powercord.api.connections.connections) {
          // don't add this account if it's already in the array
          if (props.connectedAccounts.some(account => account.type === type)) continue;

          const account = fetchAccount(type, props.userId);

          if (account) props.connectedAccounts.push(account);
        }

        console.log("a5ter:", props)

        console.groupEnd()
        return [props];
      }, true);
    }
  )

  // this module handles accessing Connections and users' connected Accounts
  lazyPatchProfileModal('ConnectableAccounts',
    m => m?.default?.getByUrl,
    m => {
      console.group("pc-connections-lazy-modal-ConnectableAccounts")

      ConnectableAccounts = m.default;
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
        console.group("pc-connections-ConnectableAccounts-filter")

        console.log("b4:", filter, connectionsArray)

        connectionsArray = connectionsArray.concat(powercord.api.connections.connections)
        console.log("a5ter:", connectionsArray)

        console.groupEnd()
        return connectionsArray;
      });


      // must return true for ConnectableAccounts.get to be called
      inject("pc-connections-ConnectableAccounts-isSupported", ConnectableAccounts, "isSupported", ([type], supported) => {
        console.group("pc-connections-ConnectableAccounts-isSupported")

        console.log("b4:", type, supported)
        supported ||= powercord.api.connections.get(type) !== null

        console.log("a5ter:", supported)

        console.groupEnd()
        return supported
      }
      );

      // have to overwrite get to prevent the original from being called, as it crashes w/ unknown connection types
      if (typeof ConnectableAccounts.__powercordOriginal_get === "undefined") {
        console.log("overwriting ConnectableAccounts.get")
        const originalGet = ConnectableAccounts.get

        ConnectableAccounts.get = (type) => {
          if (type === "spotify") return originalGet(type); // spams log otherwise

          console.group("pc-connections-ConnectableAccounts-get")

          console.log("getting type:", type)

          let ret = powercord.api.connections.get(type)
          console.log("pc:", ret)

          ret ??= originalGet(type)
          console.log("disc:", ret)

          console.groupEnd()
          return ret
        }
        ConnectableAccounts.__powercordOriginal_get = originalGet
      }
      console.groupEnd()
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
  patchConnectedAccountsStore();
  patchConnectionsManager();
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