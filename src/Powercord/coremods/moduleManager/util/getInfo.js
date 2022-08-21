// @ts-check

const { get } = require('powercord/http');
const { matchRepoURL } = require('./misc');


/**
 * @typedef RepoInfo
 * @property {'plugin'|'theme'} type
 * @property {string} name
 * @property {string} description
 * @property {string} author
 */

/**
 * @type Map<string, RepoInfo|null>
 */
const infoCache = new Map();

/**
 * @typedef PluginInfo
 * @property {string} username
 * @property {string} repoName
 * @property {'plugin'|'theme'} type Whether the URL is a plugin or theme repository
 * @property {string} name
 * @property {string} description
 * @property {string} author
 * @property {boolean} isInstalled Whether the plugin/theme is installed
 */
/**
 *
 * @param {string} identifier username/reponame/branch (branch is optional)
 * @returns {Promise<RepoInfo|null>} Whether the URL is a plugin or theme repository, or null if it's neither
 */
async function getRepoManifestData (identifier) {
  const [ username, repoName, branch ] = identifier.split('/');
  const isTheme = await get(`https://raw.githubusercontent.com/${username}/${repoName}/${branch || 'HEAD'}/powercord_manifest.json`).then((r) => {
    if (r?.statusCode === 200) {
      const json = JSON.parse(r.body);
      return {
        type: 'theme',
        name: json.name,
        description: json.description,
        author: json.author
      };
    }
    return null;
  }).catch(() => null);

  const isPlugin = await get(`https://raw.githubusercontent.com/${username}/${repoName}/${branch || 'HEAD'}/manifest.json`).then((r) => {
    if (r?.statusCode === 200) {
      const json = JSON.parse(r.body);
      return {
        type: 'plugin',
        name: json.name,
        description: json.description,
        author: json.author
      };
    }
    return null;
  }).catch(() => null);
  // Wait for either promise to resolve
  // If neither resolves, use null.

  const data = isTheme || isPlugin || null;

  infoCache.set(identifier, data);
  return data;
}

/**
 * Check if a URL is a plugin or theme repository
 * @param {string} url The URL to check
 * @returns {PluginInfo|Promise<PluginInfo|null>}
 */
module.exports = function getRepoInfo (url) {
  const repoData = matchRepoURL(url);
  if (!repoData) {
    return null;
  }

  // eslint-disable-next-line prefer-destructuring
  url = repoData.url;
  const { username, repoName, branch } = repoData;

  const identifier = `${username}/${repoName}/${branch || ''}`;

  /**
   * @type {boolean}
   */
  // @ts-ignore
  const isInstalled = powercord.pluginManager.isInstalled(repoName) || powercord.styleManager.isInstalled(repoName);

  const data = {
    url,
    username,
    repoName,
    branch,
    isInstalled
  };

  if (infoCache.has(identifier)) {
    const info = infoCache.get(identifier);
    if (!info) {
      return null;
    }
    return {
      ...data,
      ...info
    };
  }

  return getRepoManifestData(identifier).then(info => {
    if (!info) {
      return null;
    }
    return {
      ...data,
      ...info
    };
  });
};
