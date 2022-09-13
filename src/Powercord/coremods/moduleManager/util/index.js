const getRepoInfo = require('./getInfo');
const cloneRepo = require('./cloneRepo');
const { resp, matchRepoURL, isInstallerURL, REPO_URL_REGEX, getWebURL, formatGitURL, promptUninstall } = require('./misc');

module.exports = {
  getRepoInfo,
  cloneRepo,
  resp,
  matchRepoURL,
  isInstallerURL,
  getWebURL,
  formatGitURL,
  promptUninstall,
  REPO_URL_REGEX
};
