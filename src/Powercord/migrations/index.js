module.exports = async (powercord) => {
  const settings = powercord.api.settings.buildCategoryObject('rp-migrations');
  const migrations = settings.get('migrations-ran', []);

  const toRun = [];
  require('fs')
    .readdirSync(__dirname)
    .filter((file) => file !== 'index.js' && file.endsWith('.js'))
    .forEach(async (filename) => {
      const id = filename.split('.')[0];
      if (migrations.includes(id)) {
        return;
      }
      toRun.push({
        id,
        fn: require(`${__dirname}/${filename}`)
      });
    });

  if (!toRun.length) {
    console.log('%c[Replugged:Migrations]', 'color: #7289da', 'No migrations to run');
    return;
  }

  for (const migration of toRun) {
    const { id, fn } = migration;
    console.log('%c[Replugged:Migrations]', 'color: #7289da', `Running migration ${id}`);
    try {
      await fn();
      migrations.push(id);
    } catch (e) {}
    console.log('%c[Replugged:Migrations]', 'color: #7289da', `Finished migration ${id}`);
  }

  settings.set('migrations-ran', migrations);
  console.log('%c[Replugged:Migrations]', 'color: #7289da', 'Finished all migrations');
};
