const { join } = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { REPO_URL_REGEX } = require('./misc');
const { i18n: { Messages } } = require('powercord/webpack');

module.exports = async function download (url, powercord, type) {
  return new Promise((resolve) => {
  // const dir = type === 'plugin' ? join(__dirname, '..', '..') : join(__dirname, '..', '..', 'themes');
    let dir;
    switch (type) {
      case 'plugin':
        dir = join(__dirname, '..', '..', '..', '..', '..', 'plugins');
        break;
      case 'theme':
        dir = join(__dirname, '..', '..', '..', '..', '..', 'themes');
        break;
    }

    const urlMatch = url.match(REPO_URL_REGEX);
    if (!urlMatch) {
      console.error(`Could not parse URL: ${url}`);
      return;
    }
    const [ , username, repoName, branch ] = urlMatch;
    const args = [ 'clone', `https://github.com/${username}/${repoName}.git` ];
    if (branch) {
      args.push('--branch', branch);
    }
    let c;

    try {
      c = spawn('git', args, {
        cwd: dir,
        windowsHide: true
      });
    } catch (err) {
      console.error('Could not install plugin', err);
      resolve(false);
    }

    c.stdout.on('data', (data) => console.log(data.toString()));
    c.stderr.on('data', (data) => {
      data = data.toString();
      console.log(data);

      if (data.includes('already exists')) {
        powercord.api.notices.sendToast(`PDAlreadyInstalled-${repoName}`, {
          header: Messages.REPLUGGED_TOAST_PLUGIN_ALREADY_INSTALLED_HEADER,
          content: Messages.REPLUGGED_TOAST_PLUGIN_ALREADY_INSTALLED_CONTENT.format({
            name: repoName
          }),
          type: 'info',
          timeout: 10e3,
          buttons: [ {
            text: Messages.REPLUGGED_BUTTON_GOT_IT,
            color: 'green',
            size: 'medium',
            look: 'outlined'
          } ]
        });
        resolve(false);
      }
    });

    c.on('exit', async (code) => {
      if (code === 0) {
        let files;
        try {
          files = fs.readdirSync(join(dir, repoName));
        } catch (e) {
          console.log('could not do it');
          console.error(e);
          resolve(false);
        }

        if (files.includes('powercord_manifest.json') || files.includes('manifest.json')) {
          powercord.api.notices.closeToast(`PDPluginInstalling-${repoName}`);
          if (type === 'plugin') {
            await powercord.pluginManager.remount(repoName);
            if (powercord.pluginManager.plugins.has(repoName)) {
              powercord.api.notices.sendToast(`PDPluginInstalled-${repoName}`, {
                header: Messages.REPLUGGED_TOAST_PLUGIN_INSTALLED_HEADER,
                content: Messages.REPLUGGED_INSTALLED_PLUGIN_THEME.format({
                  name: repoName
                }),
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
            } else {
            // handle this error somehow
              resolve(false);
            }
          } else if (type === 'theme') {
            await powercord.styleManager.loadThemes();
            if (powercord.styleManager.themes.has(repoName)) {
              powercord.api.notices.sendToast(`PDPluginInstalled-${repoName}`, {
                header: Messages.REPLUGGED_TOAST_THEME_INSTALLED_HEADER,
                content: Messages.REPLUGGED_INSTALLED_PLUGIN_THEME.format({
                  name: repoName
                }),
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
            } else {
            // also handle this error
              resolve(false);
            }
          }
        } else {
          powercord.api.notices.sendToast('PDNoManifest', {
            header: Messages.REPLUGGED_TOAST_NO_MANIFEST.format({ type }),
            content: Messages.REPLUGGED_TOAST_NO_MANIFEST.format({ type }),
            type: 'info',
            timeout: 10e3,
            buttons: [ {
              text: Messages.REPLUGGED_BUTTON_GOT_IT,
              color: 'green',
              size: 'medium',
              look: 'outlined'
            } ]
          });
          resolve(false);
        }
      }
    });
  });
};
