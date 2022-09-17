const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

// [userId][type] -> {account}, "pending", or undefined
const _accountCache = {};

function fetchAccount (type, userId) {
  const account = _accountCache[userId]?.[type];

  // if we have a fetched account, return it
  if (account && account !== 'pending') {
    return account;

  // otherwise, if the value is empty we should start fetching it
  } else if (typeof account === 'undefined') {
    _accountCache[userId] ??= {}; // ensure we have an object for this user's accounts
    _accountCache[userId][type] = 'pending';

    const connection = powercord.api.connections.get(type);
    connection.fetchAccount(userId).then(account => {
      _accountCache[userId][type] = account ?? false; // cache a value other than undefined to stop attempting to fetch
    });
  }
}

async function patchSettingsConnections () {
  const ConnectAccountButton = await getModule(m => m?.default?.displayName === 'ConnectAccountButton');

  // set the behavior of the connect account button (discord checks for an onConnect function)
  inject('pc-connections-settings', ConnectAccountButton, 'default', ([ props ]) => {
    const connection = powercord.api.connections.get(props.type);
    if (connection) {
      props.onConnect = connection.onConnect;
    }

    return [ props ];
  }, true);
}

async function patchConnectedAccountsStore () {
  const ConnectedAccountsStore = await getModule(m => m.__proto__?.getLocalAccounts);
  const CurrentUser = await getModule([ 'getCurrentUser' ]);

  // return all of this user's plugin connections from the ConnectedAccountsStore
  inject('pc-connections-ConnectedAccountsStore', ConnectedAccountsStore.__proto__, 'getAccounts', (_, connectedAccounts) => {
    for (const { type } of powercord.api.connections.connections) {
      if (connectedAccounts.some(a => a.type === type)) {
        continue;
      }

      const account = fetchAccount(type, CurrentUser.getCurrentUser().id);
      if (account) {
        account.integrations ??= [];
        account.visibility ??= 1;

        connectedAccounts.push(account);
      }
    }

    return connectedAccounts;
  });
}

async function patchConnectionsManager () {
  const ConnectionsManager = (await getModule(m => m?.default?.completeTwoWayLink)).default;

  // overwrite the behavior of the disconnect account modal
  inject('pc-connections-ConnectionsManager-disconnect', ConnectionsManager, 'disconnect', (args) => {
    const [ type ] = args;

    const connection = powercord.api.connections.get(type);
    if (connection) {
      connection.onDisconnect?.();

      return false;
    }

    return args;
  }, true);

  // overwrite the behavior of the account visibility switch
  inject('pc-connections-ConnectionsManager-setVisibility', ConnectionsManager, 'setVisibility', (args) => {
    const [ type, , visible ] = args;

    const connection = powercord.api.connections.get(type);
    if (connection) {
      connection.setVisibility?.(visible === 1);

      return false;
    }

    return args;
  }, true);
}

async function lazyPatchProfileModal (id, filter, patch) {
  const m = getModule(filter, false);
  if (m) {
    patch(m);
  } else {
    const { useModalsStore } = await getModule([ 'useModalsStore' ]);
    inject(`pc-connections-lazy-modal-${id}`, useModalsStore, 'setState', a => {
      const og = a[0];
      a[0] = (...args) => {
        const ret = og(...args);
        try {
          if (ret?.default?.length) {
            const el = ret.default[0];
            if (el && el.render && el.render.toString().indexOf(',friendToken:') !== -1) {
              uninject(`pc-connections-lazy-modal-${id}`);
              patch(getModule(filter, false));
            }
          }
        } catch (e) {
          this.error(e);
        }
        return ret;
      };
      return a;
    }, true);
  }
}


async function patchUserConnections () {
  // User Profile Modal -> User Info section's list of connections
  lazyPatchProfileModal('Passport',
    m => m?.ConnectedUserAccount,
    Passport => {
      inject('pc-connections-profile', Passport, 'ConnectedUserAccount', ([ props ]) => {
        for (const { type } of powercord.api.connections.connections) {
          if (props.connectedAccounts.some(a => a.type === type)) {
            continue;
          }

          const account = fetchAccount(type, props.userId);
          if (account) {
            props.connectedAccounts.push(account);
          }
        }

        return [ props ];
      }, true);
    }
  );

  // this module handles accessing Connections and users' connected Accounts
  lazyPatchProfileModal('ConnectableAccounts',
    m => m?.default?.getByUrl,
    m => {
      const ConnectableAccounts = m.default;

      // filter must insert all connections (the filtering has already happened)
      inject('pc-connections-ConnectableAccounts-filter', ConnectableAccounts, 'filter',
        (_, connectionsArray) => connectionsArray.concat(powercord.api.connections.connections)
      );

      // must return true for ConnectableAccounts.get to be called
      inject('pc-connections-ConnectableAccounts-isSupported', ConnectableAccounts, 'isSupported',
        ([ type ], supported) => supported || powercord.api.connections.get(type) !== null
      );

      let originalGet;
      // have to overwrite 'get' to prevent the original from being called, as it crashes w/ unknown connection types
      if (typeof ConnectableAccounts.__powercordOriginal_get === 'undefined') {
        originalGet = ConnectableAccounts.get;

        // try to get a powercord connection, if there's none then get the discord connection
        ConnectableAccounts.get = (type) => powercord.api.connections.get(type) ?? originalGet(type);
      }
      ConnectableAccounts.__powercordOriginal_get = originalGet;
    }
  );
}

module.exports = async () => {
  patchSettingsConnections();
  patchUserConnections();
  patchConnectedAccountsStore();
  patchConnectionsManager();

  return () => {
    uninject('pc-connections-settings');
    uninject('pc-connections-ConnectedAccountsStore');
    uninject('pc-connections-ConnectionsManager-disconnect');
    uninject('pc-connections-ConnectionsManager-setVisibility');
    uninject('pc-connections-profile');
    uninject('pc-connections-ConnectableAccounts-filter');
    uninject('pc-connections-ConnectableAccounts-isSupported');
  };
};
