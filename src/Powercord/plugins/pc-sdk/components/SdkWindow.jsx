const { Flux, React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { Tooltip, HeaderBar, Clickable, Icons } = require('powercord/components');
const ForceUI = require('./ForceUI');
const SplashScreen = require('./SplashScreen');
const Settings = require('./Settings');
const TitleBar = require('./TitleBar');

const { AdvancedScrollerAuto } = getModule([ 'AdvancedScrollerAuto' ], false);

class SdkWindow extends React.PureComponent {
  constructor (props) {
    super(props);
    this.scrollerRef = React.createRef();
  }

  render () {
    return (
      <>
        <TitleBar type='WINDOWS' windowKey={'DISCORD_REPLUGGED_SANDBOX'} themeOverride={this.props.theme}/>
        {this.renderHeaderBar()}
        <div className='powercord-text powercord-sdk'>
          <AdvancedScrollerAuto className='powercord-sdk-container powercord-sdk-scroller' ref={this.scrollerRef}>
            <div>
              <ForceUI window={this.props.guestWindow}/>
              <SplashScreen/>
              <Settings exposeDevShortcuts={this.props.exposeDevShortcuts}/>
            </div>
          </AdvancedScrollerAuto>
        </div>
      </>
    );
  }

  renderHeaderBar () {
    const { title } = getModule([ 'title', 'chatContent' ], false);
    return (
      <HeaderBar transparent={false} className={[ title, 'powercord-sdk-header' ].join(' ')}>
        {this.renderIcon('Force UI', 'Arch', 'force-ui', 'right')}
        {this.renderIcon('Discord Splash Screen', 'Arch', 'splash-screen')}
        {this.renderIcon('SDK Settings', 'Gear', 'sdk-settings')}
        {this.props.windowOnTop
          ? this.renderIcon(Messages.POPOUT_REMOVE_FROM_TOP, 'Unpin', null, 'left')
          : this.renderIcon(Messages.POPOUT_STAY_ON_TOP, 'Pin', null, 'left')}
      </HeaderBar>
    );
  }

  renderIcon (tooltip, icon, id, placement = 'bottom') {
    const headerBarClasses = getModule([ 'iconWrapper', 'clickable' ], false);
    const Icon = Icons[icon];
    return (
      <Tooltip text={tooltip} position={placement}>
        <Clickable
          className={[ headerBarClasses.iconWrapper, headerBarClasses.clickable ].join(' ')}
          onClick={async () => {
            if (!id) {
              // Consider this is the always on top thing
              const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
              return popoutModule.setAlwaysOnTop('DISCORD_REPLUGGED_SANDBOX', !this.props.windowOnTop);
            }
            const el = this.props.guestWindow.document.getElementById(id);
            this.scrollerRef.current.scrollTo({
              to: el.offsetTop - 10,
              animate: true
            });
          }}
        >
          <Icon className={headerBarClasses.icon}/>
        </Clickable>
      </Tooltip>
    );
  }
}

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'theme', 'locale' ]), getModule([ 'getWindow' ]) ],
  ([ { theme }, windowStore ]) => ({
    guestWindow: windowStore.getWindow('DISCORD_REPLUGGED_SANDBOX'),
    windowOnTop: windowStore.getIsAlwaysOnTop('DISCORD_REPLUGGED_SANDBOX'),
    theme
  })
)(SdkWindow);
