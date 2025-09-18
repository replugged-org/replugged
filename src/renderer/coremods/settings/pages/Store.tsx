import { Logger } from "@replugged";
import { Button, Flex, Loader, Text, TextInput, Tooltip } from "@components";
import { React, toast } from "@common";
import { t as discordT, intl } from "@common/i18n";
import { t } from "src/renderer/modules/i18n";
import Divider from "@components/Divider";
import type {
  AnyAddonManifest,
  PluginManifest,
  RepluggedPlugin,
  RepluggedTheme,
  ThemeManifest,
} from "src/types";
import Icons from "../icons";
import { install } from "../../installer/util";
import { AddonType, Card, getManager, getSourceLink, label } from "./index";
import { viewImage } from "src/renderer/util";

const logger = Logger.coremod("AddonStore");

import "./Store.css";

function StoreAddonCard({
  manifest,
  type,
  refreshList,
  list,
  name,
  url,
}: {
  name: string;
  url: string;
  manifest: ThemeManifest | PluginManifest;
  list: Array<RepluggedPlugin | RepluggedTheme>;
  type: AddonType;
  refreshList: () => void;
}): React.ReactElement {
  const isInstalled = list.some((c) => c.manifest.id === manifest.id);
  const sourceLink = getSourceLink(manifest)!;

  const [onCooldown, setOnCooldown] = React.useState(false);
  const [cooldownTimeout, setCooldownTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [isUninstalling, setIsUninstalling] = React.useState(false);

  const copyUrl = (): void => {
    window.DiscordNative.clipboard.copy(sourceLink);
    setOnCooldown(true);
    if (cooldownTimeout) clearTimeout(cooldownTimeout);
    setCooldownTimeout(
      setTimeout(() => {
        setOnCooldown(false);
      }, 1000),
    );
  };

  const uninstallClick = async (): Promise<void> => {
    if (!isInstalled || isUninstalling) return;
    setIsUninstalling(true);
    const manager = getManager(type);
    try {
      await manager.uninstall(manifest.id);
      toast.toast(
        intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_UNINSTALL_SUCCESS, {
          name: manifest.name,
        }),
      );
    } catch (e) {
      logger.error("Error uninstalling", manifest, e);
      toast.toast(
        intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_UNINSTALL_FAILED, {
          name: manifest.name,
        }),
        toast.Kind.FAILURE,
      );
    }
    setIsUninstalling(false);
    refreshList();
  };

  const installClick = async (): Promise<void> => {
    if (isInstalled || isInstalling) return;
    setIsInstalling(true);
    await install({
      success: true,
      manifest,
      url,
      name,
    });
    setIsInstalling(false);
    refreshList();
  };

  const previewClick = async (): Promise<void> => {
    if (!onCooldown) await viewImage(manifest.image!);
    setOnCooldown(true);
    if (cooldownTimeout) clearTimeout(cooldownTimeout);
    setCooldownTimeout(
      setTimeout(() => {
        setOnCooldown(false);
      }, 1000),
    );
  };

  return (
    <Card
      manifest={manifest}
      topControls={
        isInstalled ? (
          <Button
            disabled={isUninstalling}
            look={isUninstalling ? Button.Looks.OUTLINED : Button.Looks.FILLED}
            color={Button.Colors.RED}
            onClick={() => uninstallClick()}>
            {isUninstalling ? (
              <Loader type={Loader.Type.LOW_MOTION} />
            ) : (
              intl.string(discordT.APPLICATION_CONTEXT_MENU_UNINSTALL)
            )}
          </Button>
        ) : (
          <Button
            disabled={isInstalling}
            look={isInstalling ? Button.Looks.OUTLINED : Button.Looks.FILLED}
            color={Button.Colors.BRAND}
            onClick={() => installClick()}>
            {isInstalling ? (
              <Loader type={Loader.Type.LOW_MOTION} />
            ) : (
              intl.string(t.REPLUGGED_CONFIRM_INSTALL)
            )}
          </Button>
        )
      }
      bottomControls={
        <>
          {
            <>
              {manifest.source ? (
                <Tooltip
                  text={intl.formatToPlainString(t.REPLUGGED_ADDON_SOURCE_OPEN, {
                    type: label(type, { caps: "title" }),
                  })}
                  className="replugged-addon-icon">
                  <a href={manifest.source} target="_blank" rel="noopener noreferrer">
                    <Icons.GitHub />
                  </a>
                </Tooltip>
              ) : null}
              {sourceLink ? (
                <Tooltip
                  text={intl.formatToPlainString(t.REPLUGGED_ADDON_PAGE_OPEN, {
                    type: label(type, { caps: "title" }),
                  })}
                  className="replugged-addon-icon">
                  <a href={sourceLink} target="_blank" rel="noopener noreferrer">
                    <Icons.Link />
                  </a>
                </Tooltip>
              ) : null}
              <Tooltip
                text={
                  onCooldown
                    ? intl.string(discordT.BUILD_OVERRIDE_LINK_COPIED)
                    : intl.string(discordT.BUILD_OVERRIDE_LINK_COPY)
                }
                className="replugged-addon-icon">
                <a onClick={() => !onCooldown && copyUrl()}>
                  <Icons.Clipboard />
                </a>
              </Tooltip>
            </>
          }
          {manifest.image && (
            <Tooltip
              text={intl.string(discordT.ACCESSIBILITY_SETTINGS_TTS_RATE_PREVIEW)}
              className="replugged-addon-icon">
              <a onClick={() => previewClick()}>
                <Icons.Preview />
              </a>
            </Tooltip>
          )}
        </>
      }
    />
  );
}

export default ({
  type,
  section,
  list = [],
  refreshList,
}: {
  type: AddonType;
  section: string;
  list: Array<RepluggedPlugin | RepluggedTheme>;
  refreshList: () => void;
}): React.ReactElement => {
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  const [page, setPage] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState(1);
  const [addons, setAddons] = React.useState<
    Array<{ manifest: AnyAddonManifest; url: string; name: string }>
  >([]);

  const fetchAddons = async (abortController: AbortController): Promise<void> => {
    try {
      if (loading) setLoading(true);
      if (section !== `store`) return;

      const res = await RepluggedNative.store.getList(type, page, debouncedSearch, abortController);
      if (!res.success) {
        logger.error(`Store Failed to get list for ${type}s: ${res.error}`);
        return;
      }
      const { numPages, page: newPage, list } = res;

      setTotalPage(res.numPages || 1);
      if ((numPages || 0) < page || newPage !== page) {
        setPage(newPage || 1);
      }
      setAddons(list);
      setLoading(false);
    } catch (err) {
      logger.error("Failed while fetching addon list", err);
    }
  };

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  React.useEffect(() => {
    const abortController = new AbortController();

    void fetchAddons(abortController);
    return () => {
      abortController.abort("Rerender");
    };
  }, [debouncedSearch, page]);

  return section !== `store` ? (
    <></>
  ) : (
    <>
      <div style={{ marginBottom: "20px" }}>
        <TextInput
          placeholder={intl.formatToPlainString(t.REPLUGGED_SEARCH_FOR_ADDON_STORE, {
            type: label(type),
          })}
          onChange={(e) => setSearch(e)}
          autoFocus
        />
      </div>
      <Divider style={{ margin: "20px 0px" }} />
      <div className="replugged-addon-store-cards" key={debouncedSearch}>
        {addons.length && !loading ? (
          addons.map(({ manifest, name, url }) => {
            return (
              <StoreAddonCard
                key={name}
                manifest={manifest}
                name={name}
                url={url}
                type={type}
                list={list}
                refreshList={refreshList}
              />
            );
          })
        ) : (
          <Loader type={Loader.Type.SPINNING_CIRCLE} style={{ marginTop: "100%" }} />
        )}
      </div>
      {addons.length && !loading && (
        <div className="replugged-addon-store-page-notice">
          <Flex justify={Flex.Justify.BETWEEN}>
            <Button
              color={Button.Colors.BRAND}
              look={Button.Looks.FILLED}
              size={Button.Sizes.TINY}
              disabled={page < 1 || page === 1}
              onClick={() => setPage((p) => (p > 1 ? p-- : p) && p)}>
              {"<"}
            </Button>
            <Text.Normal>
              {intl.formatToPlainString(t.REPLUGGED_STORE_PAGINATOR, {
                current: page,
                total: totalPage,
              })}
            </Text.Normal>
            <Button
              color={Button.Colors.BRAND}
              look={Button.Looks.FILLED}
              size={Button.Sizes.TINY}
              disabled={totalPage < page || totalPage === page}
              onClick={() => setPage((p) => (p < totalPage ? p++ : p) && p)}>
              {">"}
            </Button>
          </Flex>
        </div>
      )}
    </>
  );
};
