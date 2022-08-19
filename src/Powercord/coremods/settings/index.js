/* eslint-disable new-cap */
const { loadStyle } = require('../util');

const { React, getModuleByDisplayName, getModule, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');
const { sleep } = require('powercord/util');

const { enableExperiments } = require('./experiments');
const { join } = require('path');

const ErrorBoundary = require('./components/ErrorBoundary');
const GeneralSettings = require('./components/GeneralSettings');
const RepluggedLink = require('./components/RepluggedLink');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));
const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

function _renderWrapper (label, Component) {
  return React.createElement(ErrorBoundary, null,
    React.createElement(FormSection, {},
      React.createElement(FormTitle, { tag: 'h1' }, label),
      React.createElement(Component)
    )
  );
}

function _makeSection (tabId) {
  const props = powercord.api.settings.tabs[tabId];
  const label = typeof props.label === 'function' ? props.label() : props.label;
  return {
    label,
    section: tabId,
    element: () => _renderWrapper(label, props.render)
  };
}

async function patchSettingsComponent () {
  const SettingsView = await getModuleByDisplayName('SettingsView');
  const SocialLinks = await getModuleByDisplayName('SocialLinks');

  inject('pc-settings-items', SettingsView.prototype, 'getPredicateSections', (_, sections) => {
    if (sections.length < 10) {
      return sections;
    }

    const changelog = sections.find(c => c.section === 'changelog');
    if (changelog) {
      const settingsSections = Object.keys(powercord.api.settings.tabs).map(s => _makeSection(s));
      sections.splice(
        sections.indexOf(changelog), 0,
        {
          section: 'HEADER',
          label: 'Replugged'
        },
        ...settingsSections,
        { section: 'DIVIDER' }
      );
    }

    const socialsSection = sections.find(c => c.element === SocialLinks);
    if (socialsSection) {
      socialsSection.element = () => {
        const res = SocialLinks();
        res.props.children.unshift(
          React.createElement(RepluggedLink, {
            className: 'replugged-settings-icon',
            href: WEBSITE
          })
        );
        return res;
      };
    }

    const latestCommitHash = powercord.gitInfos.revision.substring(0, 7);
    const debugInfo = sections[sections.findIndex(c => c.section === 'CUSTOM') + 1];
    if (debugInfo) {
      debugInfo.element = ((_element) => function () {
        const res = _element();
        if (res.props.children && res.props.children.length === 4) {
          res.props.children.push(
            Object.assign({}, res.props.children[0], {
              props: Object.assign({}, res.props.children[0].props, {
                children: [ 'Replugged', ' ', React.createElement('span', {
                  className: res.props.children[0].props.children[4].props.className,
                  children: [ powercord.gitInfos.branch, ' (', latestCommitHash, ')' ]
                }) ]
              })
            })
          );
        }
        return res;
      })(debugInfo.element);
    }

    return sections;
  });
}

async function _forceLoadSettings () {
  await sleep(5e3); // Everyone's favorite fix
  document.body.classList.add('__powercord-no-settings-animation');
  const layers = await getModule([ 'popLayer' ], false);
  const opener = await getModule([ 'open', 'updateAccount' ], false);
  opener.open();
  layers.popLayer();
  setTimeout(() => document.body.classList.remove('__powercord-no-settings-animation'), 1100);
}

module.exports = async () => {
  powercord.api.settings.registerSettings('pc-general', {
    category: 'pc-general',
    label: () => Messages.REPLUGGED_GENERAL_SETTINGS,
    render: GeneralSettings
  });

  loadStyle(join(__dirname, 'scss/style.scss'));

  // Force load
  await _forceLoadSettings();

  patchSettingsComponent();
  if (powercord.settings.get('experiments')) {
    enableExperiments();
  }

  return () => {
    powercord.api.settings.unregisterSettings('pc-general');
    uninject('pc-settings-items');
    uninject('pc-settings-actions');
    uninject('pc-settings-errorHandler');
  };
};
