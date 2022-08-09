const INSTALLER_URL_REGEX = /https?:\/\/(?:www\.)?replugged\.dev\/install\?url=(.*)/;
const REPO_URL_REGEX = /https?:\/\/(?:www\.)?github\.com\/([^/\s>]+)\/([^/\s>]+)(?:\/tree\/([^\s>]+))?/;

exports.INSTALLER_URL_REGEX = INSTALLER_URL_REGEX;
exports.REPO_URL_REGEX = REPO_URL_REGEX;

exports.matchRepoURL = (url) => {
  const installerMatch = url.match(INSTALLER_URL_REGEX);
  if (installerMatch) {
    url = decodeURIComponent(installerMatch[1]);
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
