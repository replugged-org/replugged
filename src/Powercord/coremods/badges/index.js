const { join } = require('path');
const { React, getModule, getAllModules, getModuleByDisplayName } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');
const { get } = require('powercord/http');

const { loadStyle, unloadStyle } = require('../util');
const Badges = require('./Badges');

const cache = { _guilds: {} };
const REFRESH_INTERVAL = 1000 * 60 * 30;

let userInjectionsMax = 0;

async function injectUsers () {
  getAllModules((m) => m.default?.displayName === 'UserProfileBadgeList').forEach((UserProfileBadgeList, i) => {
    userInjectionsMax = i;

    inject(`pc-badges-users-${i}`, UserProfileBadgeList, 'default', ([ props ], res) => {
      const [ badges, setBadges ] = React.useState(null);
      const userId = props.user.id;
      React.useEffect(async () => {
        if (!cache[userId] || cache[userId].lastFetch < Date.now() - REFRESH_INTERVAL) {
          const baseUrl = powercord.settings.get('backendURL', WEBSITE);
          cache[userId] = await get(`${baseUrl}/api/v1/users/${userId}`)
            .catch((e) => e)
            .then((res) => {
              if (res.statusCode === 200 || res.statusCode === 404) {
                return {
                  badges: res.body.badges || {},
                  lastFetch: Date.now()
                };
              }

              delete cache[userId];
              return {
                badges: {},
                lastFetch: Date.now()
              };
            });
        }

        setBadges(cache[userId].badges);
      }, []);

      if (!badges) {
        return res;
      }

      const render = (Component, key, props = {}) => (
        React.createElement(Component, {
          key: `pc-${key}`,
          color: badges.custom && badges.custom.color,
          ...props
        })
      );

      if (badges.custom && badges.custom.name && badges.custom.icon) {
        res.props.children.push(render(Badges.Custom, 'cutie', badges.custom));
      }
      if (badges.developer) {
        res.props.children.push(render(Badges.Developer, 'developer'));
      }
      if (badges.staff) {
        res.props.children.push(render(Badges.Staff, 'staff'));
      }
      if (badges.support) {
        res.props.children.push(render(Badges.Support, 'support'));
      }
      if (badges.contributor) {
        res.props.children.push(render(Badges.Contributor, 'contributor'));
      }
      if (badges.translator) {
        res.props.children.push(render(Badges.Translator, 'translator'));
      }
      if (badges.hunter) {
        res.props.children.push(render(Badges.BugHunter, 'hunter'));
      }
      if (badges.early) {
        res.props.children.push(render(Badges.EarlyUser, 'early'));
      }
      if (badges.booster) {
        res.props.children.push(render(Badges.Booster, 'booster'));
      }

      return res;
    });
  });
}

async function fetchGuilds () {
  const baseUrl = powercord.settings.get('backendURL', WEBSITE);
  get(`${baseUrl}/api/v1/guilds/badges`).then(async res => {
    cache._guilds = res.body;
  });
}

async function injectGuilds () {
  const GuildHeader = await getModule([ 'AnimatedBanner', 'default' ]);
  const GuildBadge = await getModuleByDisplayName('GuildBadge');

  inject('pc-badges-guilds-header', GuildHeader.default, 'type', ([ props ], res) => {
    if (cache._guilds[props.guild.id]) {
      res.props.children[0].props.children[0].props.children[0].props.children.unshift(
        React.createElement(Badges.Custom, {
          ...cache._guilds[props.guild.id],
          tooltipPosition: 'bottom',
          gap: false
        })
      );
    }
    return res;
  });

  inject('pc-badges-guilds-tooltip', GuildBadge.prototype, 'render', function (_, res) {
    if (this.props.size && cache._guilds[this.props.guild.id]) {
      return [
        React.createElement(Badges.Custom, {
          ...cache._guilds[this.props.guild.id],
          tooltipPosition: 'bottom'
        }),
        res
      ];
    }
    return res;
  });

  fetchGuilds();
  setInterval(fetchGuilds, REFRESH_INTERVAL);
}

module.exports = async function () {
  const styleId = loadStyle(join(__dirname, 'style.css'));
  await injectUsers();
  await injectGuilds();

  return function () {
    unloadStyle(styleId);
    for (let i = 0; i <= userInjectionsMax; ++i) {
      uninject(`pc-badges-users-${i}`);
    }
    uninject('pc-badges-users-render');
    uninject('pc-badges-users-update');
    uninject('pc-badges-users-fetch');
    uninject('pc-badges-guilds-header');
    uninject('pc-badges-guilds-tooltip');

    const containerClasses = getModule([ 'subscribeTooltipText' ], false);
    const modalClasses = getModule([ 'topSectionNormal' ], false);
    if (containerClasses) {
      forceUpdateElement(`.${containerClasses.container}`);
    }
    if (modalClasses) {
      const modalHeader = document.querySelector(`.${modalClasses.topSectionNormal} header`);
      if (modalHeader) {
        const instance = getOwnerInstance(modalHeader);
        (instance._reactInternals || instance._reactInternalFiber).return.stateNode.forceUpdate();
      }
    }
  };
};
