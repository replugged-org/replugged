const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { Button, Spinner } = require('powercord/components');
const { openURL } = getModule([ 'openURL' ], false);
// @todo: merge with Product/
module.exports = ({ installing, onUninstall }) =>

  <div className='btn-group-l'>
    {<Button
      onClick={() => openURL('https://test.com')}
      look={Button.Looks.LINK}
      size={Button.Sizes.SMALL}
      color={Button.Colors.BLUE}
    >
      Link
    </Button>}

    <div className='btn-group'>
      {<Button
        disabled={installing}
        onClick={onUninstall}
        color={Button.Colors.RED}
        look={Button.Looks.FILLED}
        size={Button.Sizes.SMALL}
      >
        {installing
          ? <Spinner type='pulsingEllipsis'/>
          : Messages.APPLICATION_CONTEXT_MENU_UNINSTALL}
      </Button>}
    </div>
  </div>;
