const { WEBSITE } = require('powercord/constants');

const fs = require('fs');
const path = require('path');

const INSTALLER_PATH_REGEX = /^\/install\?url=(.*)/;
const REPO_URL_REGEX = /https?:\/\/(?:www\.)?github\.com\/([^/\s>]+)\/([^/\s>]+)(?:\/tree\/([^/\s>]+))?\/?(?=\s|$)/;

exports.REPO_URL_REGEX = REPO_URL_REGEX;

exports.isInstallerURL = (url) => {
  const backendURL = powercord.settings.get('backendURL', WEBSITE);
  return backendURL &&
    url?.startsWith?.(backendURL) &&
    INSTALLER_PATH_REGEX.test(url.slice(backendURL.length));
};

exports.matchRepoURL = (url) => {
  if (exports.isInstallerURL(url)) {
    url = new URL(url).searchParams.get('url');
  }
  if (url.match(/^[\w-]+\/[\w-.]+$/)) {
    url = `https://github.com/${url}`;
  }
  const urlMatch = url.match(REPO_URL_REGEX);
  if (!urlMatch) {
    return null;
  }
  const [ , username, repoName, branch ] = urlMatch;

  return {
    url,
    username,
    repoName,
    branch
  };
};

exports.resp = (success, description) => ({
  send: false,
  result: {
    type: 'rich',
    color: success ? 0x1bbb1b : 0xdd2d2d,
    title: success ? 'Success' : 'Error',
    description
  }
});

exports.formatGitURL = (url) => url
  .replace('.git', '')
  .replace('git@github.com:', 'https://github.com/')
  .replace('url = ', '');

exports.getWebURL = (entity, type = null) => {
  if (typeof entity === 'string') {
    if (type) {
      entity = type === 'plugin' ? powercord.pluginManager.get(entity) : powercord.styleManager.get(entity);
    } else {
      return null;
    }
  }
  let data = fs.readFileSync(path.resolve(entity.entityPath, '.git', 'config'), 'utf8');
  data = data.split('\n').map(e => e.trim());

  let url = '';
  for (let i = 0; i < data.length; i++) {
    if (data[i].startsWith('url = ')) {
      url = exports.formatGitURL(data[i]);
      break;
    }
  }
  return url;
};
