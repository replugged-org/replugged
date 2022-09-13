const { WEBSITE } = require('powercord/constants');
const Modal = require('../../moduleManager/components/ConfirmModal');
const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');

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

exports.promptUninstall = (id, isPlugin) => new Promise((resolve) => {
  const manager = isPlugin ? powercord.pluginManager : powercord.styleManager;

  openModal(() => React.createElement(Modal, {
    red: true,
    header: Messages.REPLUGGED_COMMAND_UNINSTALL_MODAL_HEADER.format({ id }),
    desc: Messages.REPLUGGED_COMMAND_UNINSTALL_MODAL_DESC.format({ id }),
    onConfirm: () => {
      manager.uninstall(id);

      powercord.api.notices.sendToast(`PDPluginUninstalled-${id}`, {
        header: Messages.REPLUGGED_COMMAND_UNINSTALL_TOAST_HEADER.format({
          type: isPlugin ? Messages.REPLUGGED_PLUGIN : Messages.REPLUGGED_THEME
        }),
        content: Messages.REPLUGGED_COMMAND_UNINSTALL_TOAST_CONTENT.format({ id }),
        type: 'info',
        timeout: 10e3,
        buttons: [ {
          text: Messages.REPLUGGED_BUTTON_GOT_IT,
          color: 'green',
          size: 'medium',
          look: 'outlined'
        } ]
      });
      resolve(true);
    },
    onCancel: () => {
      closeModal(); resolve(false);
    }
  }));
});
