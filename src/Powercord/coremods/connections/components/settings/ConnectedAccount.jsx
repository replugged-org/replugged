const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, Clickable, Icon } = require('powercord/components');
const { SwitchItem } = require('powercord/components/settings');
const { WEBSITE } = require('powercord/constants');
const { put } = require('powercord/http');

const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));

let classes;
setImmediate(async () => {
  classes = { ...await getModule([ 'connection', 'integration' ]) };
});

let lastState = null;

module.exports = class ConnectedAccount extends React.PureComponent {
  constructor (props) {
    super(props);

    this.connection = powercord.api.connections.get(props.account.type);
    this.state = lastState || {
      visibility: props.account.visibility
    };
  }

  componentWillUnmount () {
    lastState = this.state;
  }

  handleVisibilityChange (e) {
    const { account } = this.props;
    const value = e.currentTarget.checked ? 1 : 0;
    this.setState({
      visibility: value
    });
    this.setVisibility(account.type, value);
  }

  renderHeader () {
    const { props: { account }, connection } = this;
    return <div className={classes.connectionHeader}>
      <img alt={connection.name} className={classes.connectionIcon} src={connection.icon.color}/>
      <div>
        <FormText className={classes.connectionAccountValue}>{account.name}</FormText>
        <FormText
          className={classes.connectionAccountLabel}
          type='description'
        >
          {connection.name}
        </FormText>
      </div>
      <Clickable className={classes.connectionDelete} aria-label={Messages.SERVICE_CONNECTIONS_DISCONNECT} onClick={this.props.onDisconnect}>
        <Icon name='Close' width='16' height='16'/>
      </Clickable>
    </div>;
  }

  renderConnectionOptions () {
    return <div className={classes.connectionOptionsWrapper}>
      <div className={classes.connectionOptions}>
        <SwitchItem
          className={classes.connectionOptionSwitch}
          theme={SwitchItem.Themes.CLEAR}
          hideBorder={true}
          fill='rgba(255, 255, 255, .3)'
          value={this.state.visibility === 1}
          onChange={this.handleVisibilityChange.bind(this)}
        >
          <span className={classes.subEnabledTitle}>{Messages.DISPLAY_ON_PROFILE}</span>
        </SwitchItem>
      </div>
    </div>;
  }

  async setVisibility (type, value) {
    if (!powercord.account) {
      return;
    }

    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    await put(`${baseUrl}/api/v1/users/@me/accounts/${type}`)
      .set('Authorization', powercord.account.token)
      .set('Content-Type', 'application/json')
      .send({ visibility: value });
  }

  render () {
    return <div className={classes.connection}>
      {this.renderHeader()}
      {typeof this.state.visibility === 'number' && this.renderConnectionOptions()}
    </div>;
  }
};
