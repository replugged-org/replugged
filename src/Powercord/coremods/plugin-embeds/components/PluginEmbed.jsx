const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const fetchManifest = require('../utils/fetchManifest');
const CopyLink = require('./CopyLink');
const PluginEmbedIcon = require('./PluginEmbedIcon');

let LegacyText = getModuleByDisplayName('LegacyText', false);
if (!LegacyText) {
  LegacyText = getModuleByDisplayName('Text', false);
}

// Components
const Button = getModule([ 'BorderColors', 'Colors' ], false);
const Alert = getModuleByDisplayName('Alert', false);
const ModalApi = getModule([ 'openModal', 'useModalsStore' ], false);

// SVGs
const InfoFilled = getModuleByDisplayName('InfoFilled', false);

// Classes
const {
  wrapper,
  content,
  title,
  titleRegion,
  icon,
  infoLink,
  infoIcon,
  buildInfo,
  buildDetails,
  subHead
} = getModule([ 'titleRegion' ], false);

module.exports = function ({ url, match }) {
  const [ , username, reponame, branch ] = match;
  const data = fetchManifest(`https://raw.githubusercontent.com/${username}/${reponame}/${branch || 'HEAD'}/manifest.json`);

  if (data.invalid) {
    return (
      <a href={url}>{url}</a>
    );
  }

  console.log(data);
  return (
    <div className={wrapper} style={{ flexFlow: 'column' }}>
      <LegacyText size={LegacyText.Sizes.SIZE_12} className={titleRegion}>
        <strong className={title}>{data.author}</strong>
        <a
          className={infoLink}
          onClick={() => {
            ModalApi.openModal((props) => (
              <Alert
                {...props}
                title={Messages.REPLUGGED_PLUGIN_EMBED_WHATISTHIS}
                body={<p>{Messages.REPLUGGED_PLUGIN_EMBED_WHATISTHIS_CONTENT}</p>}
              />
            ));
          }}
          target="_blank">
          <InfoFilled className={infoIcon} />
        </a>
        <CopyLink url={url} />
      </LegacyText>
      <div className={content}>
        <PluginEmbedIcon className={icon} />
        <div className={buildInfo}>
          <LegacyText size={LegacyText.Sizes.SIZE_14} className={subHead}>
            {data.name}
          </LegacyText>
          <LegacyText size={LegacyText.Sizes.SIZE_16} className={buildDetails} style={{ maxWidth: '300px' }}>
            {data.description}
          </LegacyText>
        </div>
        <Button
          size={Button.Sizes.MEDIUM}
          color={
            // *TODO: IMPLEMENT THE INSTALLED CHECK
            // data.invalid
            //   ? Button.Colors.GREY
            //   : isInstalled
            //     ? Button.Colors.BLUE
            //     : Button.Colors.GREEN
            Button.Colors.GREEN
          }
          // disabled={data.invalid || isInstalled}

          // *TODO: IMPLEMENT PLUGIN INSTALLING
          // onClick={() => importPlugin(url)}>
        >
          {/* {data.invalid ? i18n.INVALID : isInstalled ? i18n.INSTALLED : i18n.INSTALL} */}
          Install
        </Button>
      </div>
    </div>
  );
};
