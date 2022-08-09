const { React } = require('powercord/webpack');
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
      confirmText={'Confirm'}
      cancelText={'Cancel'}
      onConfirm={() => this.props.onConfirm()}
      onCancel={() => typeof this.props.onCancel !== 'undefined' ? this.props.onCancel() : closeModal()}
    >
      <Text>Are you sure you want to install the {this.props.type} {this.props.repoName} from <a href={this.props.url} target="_blank">{this.props.url}</a>{this.props.branch ? ` (${this.props.branch} branch)` : ''}?</Text>
    </Confirm>;
  }
};
