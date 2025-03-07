import { React, i18n } from "@common";
import { Button, Clickable, Text, Tooltip } from "@components";
import { Logger } from "@recelled";
import { getByProps } from "@webpack";
import { t } from "src/renderer/modules/i18n";
import { openExternal } from "src/renderer/util";
import { CheckResultSuccess } from "src/types";
import { getSourceLink } from "../settings/pages";
import { InstallLinkProps, authorList, checkIsInstalled, getInfo, install } from "./util";

import "./addonEmbed.css";

const { intl } = i18n;

const logger = Logger.coremod("AddonEmbed");

type ClassMod = Record<
  | "barLoader"
  | "barTitle"
  | "buttonLoader"
  | "wrapper"
  | "content"
  | "title"
  | "titleRegion"
  | "button"
  | "buttonSize"
  | "disabledButtonOverride"
  | "icon"
  | "infoLink"
  | "infoIcon"
  | "buildInfo"
  | "buildDetails"
  | "subHead"
  | "copyLink"
  | "copyLinkIcon"
  | "copied",
  string
>;

type SvgMod = Record<
  "svgContentRight" | "svgContentLines" | "svgContentLeft" | "svgDots" | "svgTag",
  string
>;

function Link({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      className={className}
      aria-hidden="true"
      role="img"
      width="24"
      height="24"
      viewBox="0 0 24 24">
      <g fill="none" fill-rule="evenodd">
        <path
          fill="currentColor"
          d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"></path>
        <rect width="24" height="24"></rect>
      </g>
    </svg>
  );
}

const Icon = React.memo(({ className }: { className?: string }): React.ReactElement | null => {
  const svgMod = getByProps<SvgMod>("svgContentRight");
  if (!svgMod) {
    logger.error("Failed to get svgMod");
    return null;
  }
  const { svgContentRight, svgContentLines, svgContentLeft, svgDots, svgTag } = svgMod;

  return (
    <svg width="57" height="40" viewBox="0 0 57 40" fill="none" className={className}>
      <path
        d="M49.4949 36H3.9596C1.78182 36 0 34.2486 0 32.1081V3.89189C0 1.75135 1.78182 0 3.9596 0H49.4949C51.6727 0 53.4545 1.75135 53.4545 3.89189V32.1081C53.4545 34.2486 51.6727 36 49.4949 36Z"
        className={svgContentRight}
      />
      <path
        d="M44.5456 10.8889H25.7375C24.6486 10.8889 23.7577 9.99798 23.7577 8.90909C23.7577 7.8202 24.6486 6.92929 25.7375 6.92929H44.5456C45.6345 6.92929 46.5254 7.8202 46.5254 8.90909C46.5254 9.99798 45.6345 10.8889 44.5456 10.8889ZM19.7981 10.8889C18.7092 10.8889 17.8183 9.99798 17.8183 8.90909C17.8183 7.8202 18.7092 6.92929 19.7981 6.92929C20.887 6.92929 21.7779 7.8202 21.7779 8.90909C21.7779 9.99798 20.887 10.8889 19.7981 10.8889ZM44.5456 19.798H25.7375C24.6486 19.798 23.7577 18.9071 23.7577 17.8182C23.7577 16.7293 24.6486 15.8384 25.7375 15.8384H44.5456C45.6345 15.8384 46.5254 16.7293 46.5254 17.8182C46.5254 18.9071 45.6345 19.798 44.5456 19.798ZM19.7981 19.798C18.7092 19.798 17.8183 18.9071 17.8183 17.8182C17.8183 16.7293 18.7092 15.8384 19.7981 15.8384C20.887 15.8384 21.7779 16.7293 21.7779 17.8182C21.7779 18.9071 20.887 19.798 19.7981 19.798ZM31.6365 28.7071H25.7375C24.6486 28.7071 23.7577 27.8162 23.7577 26.7273C23.7577 25.6384 24.6486 24.7475 25.7375 24.7475H31.6365C32.7254 24.7475 33.6163 25.6384 33.6163 26.7273C33.6163 27.8162 32.7254 28.7071 31.6365 28.7071ZM19.7981 28.7071C18.7092 28.7071 17.8183 27.8162 17.8183 26.7273C17.8183 25.6384 18.7092 24.7475 19.7981 24.7475C20.887 24.7475 21.7779 25.6384 21.7779 26.7273C21.7779 27.8162 20.887 28.7071 19.7981 28.7071Z"
        className={svgContentLines}
      />
      <path
        d="M3.9596 36H13.8586V0H3.9596C1.78182 0 0 1.78182 0 3.9596V32.0404C0 34.2182 1.78182 36 3.9596 36Z"
        className={svgContentLeft}
      />
      <path
        d="M6.9293 10.8889C5.24647 10.8889 3.9596 9.60202 3.9596 7.91919C3.9596 6.23636 5.24647 4.94949 6.9293 4.94949C8.61212 4.94949 9.89899 6.23636 9.89899 7.91919C9.89899 9.60202 8.61212 10.8889 6.9293 10.8889ZM6.9293 20.7879C5.24647 20.7879 3.9596 19.501 3.9596 17.8182C3.9596 16.1354 5.24647 14.8485 6.9293 14.8485C8.61212 14.8485 9.89899 16.1354 9.89899 17.8182C9.89899 19.501 8.61212 20.7879 6.9293 20.7879ZM6.9293 30.6869C5.24647 30.6869 3.9596 29.4 3.9596 27.7172C3.9596 26.0343 5.24647 24.7475 6.9293 24.7475C8.61212 24.7475 9.89899 26.0343 9.89899 27.7172C9.89899 29.4 8.61212 30.6869 6.9293 30.6869Z"
        className={svgDots}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M41.4328 33L46 37.7129L43.7836 40L37 32.9999L39.2164 30.7128L39.2165 30.7129L43.7836 26L46 28.2871L41.4328 33Z"
        className={svgTag}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M54.7821 35.2871L54.7841 35.2892L57 33.0021L50.2159 26L48 28.2871L52.5662 33L48 37.7129L50.2159 40L54.7821 35.2871Z"
        className={svgTag}
      />
    </svg>
  );
});

const Embed = React.memo(
  (
    props:
      | { loading: true }
      | {
          loading?: false;
          authors: string;
          url: string;
          onCooldown: boolean;
          copyUrl: () => void;
          name: string;
          description: string;
          isInstalled: boolean;
          isInstalling: boolean;
          installClick: () => void;
        },
  ): React.ReactElement | null => {
    const classMod = getByProps<ClassMod>("titleRegion");
    if (!classMod) {
      logger.error("Failed to find classMod");
      return null;
    }

    const {
      barLoader,
      barTitle,
      buttonLoader,
      wrapper,
      content,
      title,
      titleRegion,
      button,
      buttonSize,
      icon,
      buildInfo,
      buildDetails,
      subHead,
      copyLink,
      copyLinkIcon,
      copied,
    } = classMod;

    return (
      <div className={wrapper}>
        <Text.Eyebrow className={titleRegion}>
          {props.loading ? (
            <div className={barLoader} />
          ) : (
            <>
              <Tooltip text={props.authors} className="recelled-addon-embed-title-tooltip">
                <strong className={`${title} recelled-addon-embed-title`}>{props.authors}</strong>
              </Tooltip>
              <Clickable
                className={`${copyLink} recelled-addon-embed-store-button`}
                onClick={() => openExternal(props.url)}>
                {intl.string(t.RECELLED_INSTALLER_OPEN_STORE)}
              </Clickable>
              <Clickable
                className={`${copyLink} recelled-addon-embed-copy-button${
                  props.onCooldown ? ` ${copied} addon-embed-copied` : ""
                }`}
                onClick={props.copyUrl}>
                <Link className={copyLinkIcon} />
                {props.onCooldown
                  ? intl.string(t.RECELLED_PLUGIN_EMBED_COPIED)
                  : intl.string(t.RECELLED_PLUGIN_EMBED_COPY)}
              </Clickable>
            </>
          )}
        </Text.Eyebrow>
        <div className={content}>
          <div className="addon-embed-main-content">
            <Icon className={icon} />
            <div className={`${buildInfo} addon-embed-build-info`}>
              {props.loading ? (
                <div className={subHead}>
                  <div className={`${barLoader} ${barTitle}`} />
                </div>
              ) : (
                <Text className={subHead} variant={"text-sm/semibold"}>
                  {props.name}
                </Text>
              )}
              {props.loading ? (
                <div className={buildDetails}>
                  <div className={barLoader} />
                </div>
              ) : (
                <Tooltip text={props.description}>
                  <div style={{ minWidth: "0px" }}>
                    <Text className={buildDetails} variant={"text-md/semibold"}>
                      {props.description}
                    </Text>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
          {props.loading ? (
            <div className={buttonLoader} />
          ) : (
            <Tooltip
              text={intl.formatToPlainString(t.RECELLED_ERROR_ALREADY_INSTALLED, {
                name: props.name,
              })}
              className="recelled-addon-embed-button-tooltip"
              shouldShow={props.isInstalled ? undefined : false}
              hideOnClick={false}>
              <Button
                className={`${button} ${buttonSize} recelled-addon-embed-button`}
                style={{
                  minWidth: "auto",
                  maxWidth: "auto",
                }}
                // Workaround because the disabled attribute causes issues with the styles
                aria-disabled={props.isInstalled || props.isInstalling}
                color={
                  props.isInstalled || props.isInstalling ? Button.Colors.TRANSPARENT : undefined
                }
                onClick={props.installClick}>
                {intl.string(t.RECELLED_CONFIRM_INSTALL)}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    );
  },
);

const AddonEmbed = React.memo(
  ({
    addon,
    fallback,
  }: {
    addon: InstallLinkProps;
    fallback: React.ReactElement | null;
  }): React.ReactElement | null => {
    const [data, setData] = React.useState<CheckResultSuccess | undefined | null>(undefined);
    React.useEffect(() => {
      (async () => {
        const info = await getInfo(addon.identifier, addon.source, addon.id);
        setData(info);
      })();
    }, []);
    const [onCooldown, setOnCooldown] = React.useState(false);
    const [cooldownTimeout, setCooldownTimeout] = React.useState<NodeJS.Timeout | null>(null);
    const [isInstalling, setIsInstalling] = React.useState(false);
    if (data === undefined) return <Embed loading />;
    if (data === null) return fallback;

    const { manifest } = data;
    if (manifest.type === "recelled") return fallback;

    const authors = authorList([manifest.author].flat().map((x) => x.name));
    const url = getSourceLink(manifest)!; // URL should always exist since it's from store
    const isInstalled = checkIsInstalled(data);

    const copyUrl = (): void => {
      window.DiscordNative.clipboard.copy(url);
      setOnCooldown(true);
      if (cooldownTimeout) clearTimeout(cooldownTimeout);
      setCooldownTimeout(
        setTimeout(() => {
          setOnCooldown(false);
        }, 2000),
      );
    };

    const installClick = async (): Promise<void> => {
      // Since we're not actually disabling the button, check if it's disabled before running
      if (isInstalled || isInstalling) return;
      setIsInstalling(true);
      await install(data);
    };

    return (
      <Embed
        loading={false}
        authors={authors}
        url={url}
        onCooldown={onCooldown}
        copyUrl={copyUrl}
        name={manifest.name}
        description={manifest.description}
        isInstalled={isInstalled}
        isInstalling={isInstalling}
        installClick={installClick}
      />
    );
  },
);

export default AddonEmbed;
