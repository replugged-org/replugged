const { getModule } = require('powercord/webpack');
const { COMMAND_SECTION: section } = require('powercord/commands');
const { uninject } = require('powercord/injector');

const util = require('./util');

/* eslint-disable dot-notation */
async function patchAutocomplete () {
  const ChannelApplicationIcon = await getModule(m => m.type?.displayName === 'ChannelApplicationIcon');
  util.inject('commands-force-channel-app-icon', ChannelApplicationIcon, 'default', (args) => {
    const [ props ] = args ?? [];

    if (!props?.section && props.command?.__$$Replugged) {
      props.section = section;
    }

    return args;
  }, true);

  const ApplicationCommandItem = await getModule(m => m.default?.displayName === 'ApplicationCommandItem');
  util.inject('commands-force-command-app-icon', ApplicationCommandItem, 'default', (args) => {
    const [ props ] = args ?? [];

    if (!props?.section && props.command?.__$$Replugged) {
      props.section = section;
    }

    return args;
  }, true);

  const CommandAPI = await getModule([ 'getBuiltInCommands' ]);
  if (CommandAPI?.BUILT_IN_SECTIONS) {
    CommandAPI.BUILT_IN_SECTIONS[section.id] = section;
  }

  const AssetModule = await getModule([ 'getApplicationIconURL' ]);
  util.inject('commands-section-icon', AssetModule, 'getApplicationIconURL', ([ props ], url) => {
    if (props?.id === section['id']) {
      return section['icon'];
    }

    return url;
  });

  const SearchStore = await getModule([ 'useSearchManager' ]);

  util.__$$InjectionCache.oldGetApplicationSections = SearchStore.default.getApplicationSections;

  SearchStore.default.getApplicationSections = function (...args) {
    try {
      const sections = util.__$$InjectionCache.oldGetApplicationSections.apply(this, args) ?? [];

      if (!sections.find(s => s.id === section.id)) {
        sections.push(section);
      }

      return sections;
    } catch {
      return [];
    }
  };

  util.inject('commands-popluate-cmds', SearchStore.default, 'getQueryCommands', ([ , , query ], commands) => {
    if (!query || query.startsWith('/')) {
      return commands;
    }

    commands ??= [];

    for (const command of Object.values(powercord.api.commands.$$commands)) {
      const exists = commands.some(c => c.__$$Powercord && c.id === command.id);
      if (!~command.name?.indexOf(query) || exists) {
        continue;
      }

      try {
        commands.unshift(command);
      } catch {
        commands = [ ...commands, command ];
      }
    }

    return commands;
  });

  util.inject('commands-populate-search', SearchStore, 'useSearchManager', ([ , type ], res) => {
    if (type !== 1 || !powercord.api.commands.size) {
      return res;
    }

    const customSectionId = section['id'];

    if (!res.sectionDescriptors?.find?.(s => s.id === customSectionId)) {
      res.sectionDescriptors ??= [];
      res.sectionDescriptors.push(section);
    }

    if ((!res.filteredSectionId || res.filteredSectionId === customSectionId) && !res.activeSections.find(s => s.id === customSectionId)) {
      res.activeSections.push(section);
    }

    const commands = Object.values(powercord.api.commands.$$commands);
    if (commands.some(c => !res.commands?.find?.(r => c.__$$Powercord && r.id === c.id))) {
      res.commands ??= [];

      const collection = [ ...res.commands, ...commands ];
      res.commands = [ ...new Set(collection).values() ];
    }

    if ((!res.filteredSectionId || res.filteredSectionId === customSectionId) && !res.commandsByActiveSection.find(c => c.section.id === customSectionId)) {
      res.commandsByActiveSection.push({
        section,
        data: commands
      });
    }

    const active = res.commandsByActiveSection.find(c => c.section.id === customSectionId);
    if ((!res.filteredSectionId || res.filteredSectionId === customSectionId) && active && active.data.length === 0 && powercord.api.commands.size !== 0) {
      active.data = commands;
    }

    const builtInSections = res.sectionDescriptors.filter(s => s.id === '-1');
    const builtInSection = res.commandsByActiveSection.find(c => c.section.id === '-1');
    if (builtInSections.length > 1) {
      res.sectionDescriptors.splice(res.sectionDescriptors.lastIndexOf(builtInSections[0]), 1);
      res.activeSections.splice(res.activeSections.lastIndexOf(builtInSections[0]), 1);
      res.commandsByActiveSection.splice(res.commandsByActiveSection.lastIndexOf(builtInSection), 1);
    }

    return res;
  });

  return () => {
    for (const id of util.__$$InjectionCache.ids) {
      uninject(id);
    }

    SearchStore.default.getApplicationSections = util.__$$InjectionCache.oldGetApplicationSections;
  };
}

module.exports = async () => {
  util.loadDefaultCommands();

  const { BOT_AVATARS } = await getModule([ 'BOT_AVATARS' ]);
  BOT_AVATARS.replugged = 'https://cdn.discordapp.com/attachments/1000955992068079716/1004196106055454820/Replugged-Logo.png';

  const cleanup = await patchAutocomplete();

  powercord.api.commands.$$commands = Object.values(powercord.api.commands.commands)
    .sort((a, b) => a.command.localeCompare(b.command))
    .reduce((commands, command) => {
      commands[command.command] = util.parseCommand(command);

      return commands;
    }, {});

  const _boundAddCommand = util.addCommand.bind(util);
  const _boundRemoveCommand = util.removeCommand.bind(util);

  powercord.api.commands.on('commandAdded', _boundAddCommand);
  powercord.api.commands.on('commandRemoved', _boundRemoveCommand);

  return () => {
    util.unloadDefaultCommands();

    delete BOT_AVATARS.replugged;

    cleanup();

    powercord.api.commands.off('commandAdded', _boundAddCommand);
    powercord.api.commands.off('commandRemoved', _boundRemoveCommand);
  };
};
