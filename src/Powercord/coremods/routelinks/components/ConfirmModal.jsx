const { React, i18n: { Messages } } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const {
  Text
} = require('powercord/components');
const { close: closeModal } = require('powercord/modal');

let setting;

module.exports = class Modal extends React.Component {
  render () {
    if (this.options && this.options.setting) {
      ({ setting } = this.options);

      if (!setting.default) {
        setting.default = '';
      }
    }

    return <Confirm
      red={true}
      header={`Install ${this.props.type}`}
      confirmText={Messages.REPLUGGED_CONFIRM}
      cancelText={Messages.REPLUGGED_CANCEL}
      onConfirm={() => this.props.onConfirm()}
      onCancel={() => typeof this.props.onCancel !== 'undefined' ? this.props.onCancel() : closeModal()}
    > //Are you sure you want to install the {} {} from ?
      <Text> {Messages.REPLUGGED_MODULE_MANAGER_CONFIRM_INSTALL.format({
        type: this.props.type,
        name: this.props.repoName,
        url: `<a href={this.props.url} target="_blank">${this.props.url}</a>`
        branch: this.props.branch ? `(${this.props.branch} branch)`: ''
      })} </Text>
    </Confirm>;
  }
};
