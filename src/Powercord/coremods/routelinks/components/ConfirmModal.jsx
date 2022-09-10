const { React, i18n: { Messages }, getModuleByDisplayName } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const {
  Text
} = require('powercord/components');
const { close: closeModal } = require('powercord/modal');

const Anchor = getModuleByDisplayName('Anchor', false);

let setting;

module.exports = class Modal extends React.Component {
  render () {
    if (this.options && this.options.setting) {
      ({ setting } = this.options);

      if (!setting.default) {
        setting.default = '';
      }
    }

    const text = Messages.REPLUGGED_MODULE_MANAGER_CONFIRM_INSTALL.format({
      type: this.props.type,
      name: this.props.repoName,
      url: '{url}', // Will be replaced later
      branch: this.props.branch ? Messages.REPLUGGED_INSTALL_MODAL_BRANCH.format({ branch: this.props.branch }) : ''
    });

    const parts = text.split('{url}');
    parts.splice(1, 0, <Anchor href={this.props.url}>{this.props.url}</Anchor>);

    return <Confirm
      red={true}
      header={Messages.REPLUGGED_INSTALL_MODAL_HEADER.format({ type: this.props.type })}
      confirmText={Messages.REPLUGGED_CONFIRM}
      cancelText={Messages.REPLUGGED_CANCEL}
      onConfirm={() => this.props.onConfirm()}
      onCancel={() => typeof this.props.onCancel !== 'undefined' ? this.props.onCancel() : closeModal()}
    >
      <Text>
        {parts}
      </Text>
    </Confirm>;
  }
};
