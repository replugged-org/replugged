const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');

const ViewRepo = require('./ViewRepo');
const CopyLink = require('./CopyLink');
const PluginEmbedIcon = require('./PluginEmbedIcon');

const { cloneRepo, getRepoInfo } = require('../../moduleManager/util');

let LegacyText = getModuleByDisplayName('LegacyText', false);
if (!LegacyText) {
  LegacyText = getModuleByDisplayName('Text', false);
}
const Anchor = getModuleByDisplayName('Anchor', false);

// Components
const { default: Button, ButtonSizes } = getModule([ 'ButtonColors' ], false);
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
  button,
  icon,
  infoLink,
  infoIcon,
  buildInfo,
  buildDetails,
  disabledButtonOverride,
  subHead
} = getModule([ 'titleRegion' ], false);

module.exports = function ({ match }) {
  const { url } = match;
  const [ data, setData ] = React.useState(null);

  const fetchInfo = () => {
    const repoInfo = getRepoInfo(url);
    if (repoInfo instanceof Promise) {
      repoInfo.then(setData);
    } else {
      setData(repoInfo);
    }
  };

  React.useEffect(fetchInfo, []);

  if (!data) {
    return (
      <Anchor href={url}>{url}</Anchor>
    );
  }

  return (
    <div className={wrapper} onMouseEnter={fetchInfo}>
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
        <ViewRepo url={data.url} />
        <CopyLink url={data.url} />
      </LegacyText>
      <div className={content}>
        <PluginEmbedIcon className={icon} />
        <div className={buildInfo}>
          <LegacyText size={LegacyText.Sizes.SIZE_14} className={subHead}>
            {data.name}
          </LegacyText>
          <Tooltip text={data.description}>
            <LegacyText size={LegacyText.Sizes.SIZE_16} className={buildDetails} style={{ maxWidth: '300px' }} >
              {data.description}
            </LegacyText>
          </Tooltip>
        </div>
        <Button
          size={ButtonSizes.MEDIUM}
          className={`${button} ${data.isInstalled ? disabledButtonOverride : ''}`}
          disabled={data.isInstalled}
          onClick={() => {
            if (!data.isInstalled) {
              cloneRepo(data.url, powercord, data.type).then(fetchInfo);
            }
          }}
        >
          {data.isInstalled ? Messages[`REPLUGGED_PLUGIN_EMBED_ALREADY_INSTALLED_${data.type.toUpperCase()}`] : Messages[`REPLUGGED_PLUGIN_EMBED_INSTALL_${data.type.toUpperCase()}`]}
        </Button>
      </div>
    </div>
  );
};
