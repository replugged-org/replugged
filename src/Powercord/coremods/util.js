const { React, getModule, i18n: { _chosenLocale: currentLocale } } = require('powercord/webpack');
const { createElement } = require('powercord/util');
const { resolveCompiler } = require('powercord/compilers');
const { REPO_URL, CACHE_FOLDER } = require('powercord/constants');

const { readdirSync, existsSync, lstatSync } = require('fs');
const path = require('path');

module.exports = {
  loadStyle (file) {
    const id = Math.random().toString(36).slice(2);
    const style = createElement('style', {
      id: `style-coremod-${id}`,
      'data-powercord': true,
      'data-coremod': true
    });

    document.head.appendChild(style);
    const compiler = resolveCompiler(file);
    compiler.compile().then(css => (style.innerHTML = css));
    return id;
  },

  unloadStyle (id) {
    const el = document.getElementById(`style-coremod-${id}`);
    if (el) {
      el.remove();
    }
  },

  debugInfo (getSetting) {
    const { getRegisteredExperiments, getExperimentOverrides } = getModule([ 'initialize', 'getExperimentOverrides' ], false);
    const { apiManager: { apis }, api: { commands: { commands }, settings: { store: settingsStore } } } = powercord;
    const superProperties = getModule([ 'getSuperPropertiesBase64' ], false).getSuperProperties();
    const plugins = powercord.pluginManager.getPlugins().filter(plugin => powercord.pluginManager.isEnabled(plugin));

    const enabledLabs = powercord.api.labs.experiments.filter(e => powercord.api.labs.isExperimentEnabled(e.id));
    const experimentOverrides = Object.keys(getExperimentOverrides()).length;
    const availableExperiments = Object.keys(getRegisteredExperiments()).length;

    const discordPath = process.resourcesPath.slice(0, -10);
    const maskPath = (path) => {
      path = path.replace(/(?:\/home\/|C:\\Users\\|\/Users\/)([ \w.-]+).*/i, (path, username) => {
        const usernameIndex = path.indexOf(username);
        return [ path.slice(0, usernameIndex), username.charAt(0) + username.slice(1).replace(/[a-zA-Z]/g, '*'),
          path.slice(usernameIndex + username.length) ].join('');
      });

      return path;
    };

    const cachedFiles = (existsSync(CACHE_FOLDER) && readdirSync(CACHE_FOLDER)
      .filter(d => lstatSync(`${CACHE_FOLDER}/${d}`).isDirectory())
      .map(d => readdirSync(`${CACHE_FOLDER}/${d}`))
      .flat().length) || 'n/a';

    return `\`\`\`ini
    # Debugging Information | Result created: ${new Date().toUTCString()}
    [SYSTEM / DISCORD]
    Locale="${currentLocale}"
    OS="${window.platform.os.family}${window.platform.os.architecture === 64 ? ' 64-bit' : ''}"
    Architecture="${superProperties.os_arch}"
    ${process.platform === 'linux'
    ? `Distro="${superProperties.distro || 'n/a'}"`
    : ''}
    ReleaseChannel="${superProperties.release_channel}"
    AppVersion="${superProperties.client_version}"
    BuildNumber="${superProperties.client_build_number}"
    BuildID="${window.GLOBAL_ENV.SENTRY_TAGS.buildId.slice(0, 7)}"
    Experiments="${experimentOverrides}/${availableExperiments}"

    [PROCESS VERSIONS]
    React="${React.version}"
    Electron="${process.versions.electron}"
    Chrome="${process.versions.chrome}"
    Node="${process.versions.node}"

    [REPLUGGED]
    Commands="${Object.keys(commands).length}"
    Settings="${Object.keys(settingsStore.getAllSettings()).length}"
    Plugins="${powercord.pluginManager.getPlugins()
    .filter(plugin => powercord.pluginManager.isEnabled(plugin)).length}/${powercord.pluginManager.plugins.size}"
    Themes="${powercord.styleManager.getThemes()
    .filter(theme => powercord.styleManager.isEnabled(theme)).length}/${powercord.styleManager.themes.size}"
    Labs="${enabledLabs.length}/${powercord.api.labs.experiments.length}"
    SettingsSync="${powercord.settings.get('settingsSync', false)}"
    CachedFiles="${cachedFiles}"
    Account="${!!powercord.account}"
    APIs="${apis.length}"

    [GIT]
    Upstream="${powercord.gitInfos.upstream.replace(REPO_URL, 'Official')}"
    Revision="${powercord.gitInfos.revision.substring(0, 7)}"
    Branch="${powercord.gitInfos.branch}"
    Latest="${!getSetting('updates', []).find(update => update.id === 'powercord')}"

    [LISTINGS]
    RepluggedPath="${maskPath(powercord.basePath)}"
    DiscordPath="${maskPath(discordPath)}"
    Experiments="${experimentOverrides > 0 ? Object.keys(getExperimentOverrides()).join(', ') : 'n/a'}"
    Labs="${enabledLabs.length ? enabledLabs.map(e => e.name).join(', ') : 'n/a'}"
    Plugins="${plugins.join(', ')}"\`\`\``;
  },
  
  formatURL(url) {
    return url
      .replace('.git', '')
      .replace('git@github.com:', 'https://github.com/')
      .replace('url = ', '');
  },
  
  getURL(entity, type=null) {
    if (typeof entity === 'string') {
      if (type) {
        entity = type === 'plugin' ? powercord.pluginManager.get(entity) : powercord.styleManager.get(entity);
      } else {
        return false;
      }
    }
    let data = readFileSync(path.resolve(entity.entityPath, '.git', 'config'), 'utf8');
    data = data.split('\n').map(e => e.trim());
    
    let url = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].startsWith('url = ')) {
        url = this.formatURL(data[i]);
        break;
      }
    }
    return url;
  }
};
