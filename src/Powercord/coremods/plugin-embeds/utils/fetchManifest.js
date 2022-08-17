const { React } = require('powercord/webpack');

const cache = {};

const invalid = {
  name: 'Invalid plugin.',
  description: 'This plugin does not exist.',
  author: 'Unknown',
  invalid: true
};

module.exports = function (url) {
  const [ module, setModule ] = React.useState(cache[url]);

  React.useEffect(() => {
    if (cache[url]) {
      return;
    }

    fetch(url)
      .then((r) => r.json())
      .then(
        (data) => {
          cache[url] = data;
          setModule(data);
        },
        () => {
          cache[url] = invalid;
          setModule(invalid);
        }
      );
  }, [ url ]);

  return (
    module ?? {
      name: 'Loading...',
      description: 'This plugin is still loading...',
      author: 'Loading...'
    }
  );
};
module.exports.cache = cache;
