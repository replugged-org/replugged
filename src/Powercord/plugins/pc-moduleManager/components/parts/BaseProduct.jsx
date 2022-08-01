const { React, getModule, constants: { Routes }, i18n: { Messages } } = require('powercord/webpack');
const { Divider, Button } = require('powercord/components');

const { shell: { openExternal } } = require('electron');

const Details = require('./Details');
const Permissions = require('./Permissions');

class BaseProduct extends React.PureComponent {
  renderDetails () {
    return (
      <>
        <Divider/>
        <Details
          svgSize={24}
          author={this.props.product.author}
          version={this.props.product.version}
          description={this.props.product.description}
          license={this.props.product.license}
        />
      </>
    );
  }

  renderPermissions () {
    const hasPermissions = this.props.product.permissions && this.props.product.permissions.length > 0;

    if (!hasPermissions) {
      return null;
    }

    return (
      <>
        <Divider/>
        <Permissions svgSize={22} permissions={this.props.product.permissions}/>
      </>
    );
  }

  renderFooter () {
    if (!this.props.product.discord && typeof this.props.goToSettings !== 'function' && typeof this.props.onUninstall !== 'function') {
      return null;
    }

    return (
      <>
        <Divider/>
        <div className=' powercord-product-footer'>
          {this.props.product.discord &&
          <Button
            onClick={() => this.goToDiscord(this.props.product.discord)}
            look={Button.Looks.LINK}
            size={Button.Sizes.SMALL}
            color={Button.Colors.TRANSPARENT}
          > {Messages.REPLUGGED_PLUGINS_DISCORD}
          </Button>
          }

          {this.props.product.website &&
              <Button
                onClick={() => openExternal(this.props.product.website)}
                look={Button.Looks.LINK}
                size={Button.Sizes.SMALL}
                color={Button.Colors.TRANSPARENT}
              > {Messages.REPLUGGED_PLUGINS_WEBSITE}
              </Button>
          }

          {this.props.product.repository &&
            <Button
              onClick={() => openExternal(this.props.product.repository)}
              look={Button.Looks.LINK}
              size={Button.Sizes.SMALL}
              color={Button.Colors.TRANSPARENT}
            > {Messages.REPLUGGED_PLUGINS_GITHUB}
            </Button>
          }

          <div className='buttons'>
            {typeof this.props.onUninstall === 'function' &&
            <Button
              onClick={() => this.props.onUninstall()}
              color={Button.Colors.RED}
              look={Button.Looks.FILLED}
              size={Button.Sizes.SMALL}
            >
              {Messages.APPLICATION_CONTEXT_MENU_UNINSTALL}
            </Button>
            }
          </div>
        </div>
      </>
    );
  }

  async goToDiscord (code) {
    const inviteLocalStore = await getModule([ 'getInvite' ]);
    const inviteRemoteStore = await getModule([ 'resolveInvite' ]);
    const guildsStore = await getModule([ 'getGuilds' ]);
    let invite = inviteLocalStore.getInvite(code);
    if (!invite) {
      // eslint-disable-next-line prefer-destructuring
      invite = (await inviteRemoteStore.resolveInvite(code)).invite;
    }

    if (guildsStore.getGuilds()[invite.guild.id]) {
      const channel = await getModule([ 'getLastSelectedChannelId' ]);
      const router = await getModule([ 'transitionTo' ]);
      // eslint-disable-next-line new-cap
      router.transitionTo(Routes.CHANNEL(invite.guild.id, channel.getChannelId(invite.guild.id)));
    } else {
      const windowManager = await getModule([ 'flashFrame', 'minimize' ]);
      const { INVITE_BROWSER: { handler: popInvite } } = await getModule([ 'INVITE_BROWSER' ]);
      const oldMinimize = windowManager.minimize;
      windowManager.minimize = () => void 0;
      popInvite({ args: { code } });
      windowManager.minimize = oldMinimize;
    }
  }
}

module.exports = BaseProduct;
