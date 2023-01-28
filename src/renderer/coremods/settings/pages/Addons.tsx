import { Messages } from "@common/i18n";
import { React, api, fluxDispatcher, modal, toast, users } from "@common";
import { Button, Divider, Flex, Switch, Text, TextInput, Tooltip } from "@components";
import type { RepluggedPlugin, RepluggedTheme } from "src/types";
import "./Addons.css";
import Icons from "../icons";
import { Logger, plugins, themes } from "@replugged";
import { showAddonSettings } from "./AddonSettings";

const logger = Logger.coremod("AddonSettings");

enum AddonType {
  Plugin = "plugin",
  Theme = "theme",
}

function getRepluggedNative(type: AddonType) {
  if (type === AddonType.Plugin) {
    return window.RepluggedNative.plugins;
  }
  if (type === AddonType.Theme) {
    return window.RepluggedNative.themes;
  }
  throw new Error("Invalid addon type");
}

function getManager(type: AddonType) {
  if (type === AddonType.Plugin) {
    return plugins;
  }
  if (type === AddonType.Theme) {
    return themes;
  }
  throw new Error("Invalid addon type");
}

function getSettingsElement(id: string, type: AddonType) {
  if (type === AddonType.Plugin) {
    return plugins.getExports(id)?.Settings;
  }
  if (type === AddonType.Theme) {
    return undefined;
  }

  throw new Error("Invalid addon type");
}

function listAddons(type: AddonType) {
  if (type === AddonType.Plugin) {
    return plugins.plugins;
  }
  if (type === AddonType.Theme) {
    return themes.themes;
  }
  throw new Error("Invalid addon type");
}

async function openUserProfile(id: string) {
  if (!users.getUser(id)) {
    try {
      const { body } = await api.get({
        url: `/users/${id}/profile`,
        query: {
          // eslint-disable-next-line camelcase
          with_mutual_friends_count: "true",
          // eslint-disable-next-line camelcase
          with_mutual_guilds: "true",
        },
      });
      fluxDispatcher.dispatch({ type: "USER_UPDATE", user: body.user });
      fluxDispatcher.dispatch({ type: "USER_PROFILE_FETCH_SUCCESS", ...body });
    } catch (e) {
      try {
        const { body } = await api.get({
          url: `/users/${id}`,
        });
        fluxDispatcher.dispatch({ type: "USER_UPDATE", user: body });
      } catch (e) {
        logger.error(`Failed to fetch user profile for ${id}`, e);
        toast.toast(Messages.REPLUGGED_TOAST_PROFILE_FETCH_FAILED, toast.Kind.FAILURE);
        return;
      }
    }
  }
  fluxDispatcher.dispatch({
    type: "USER_PROFILE_MODAL_OPEN",
    userId: id,
  });
}

function getAuthors(addon: RepluggedPlugin | RepluggedTheme) {
  return [addon.manifest.author].flat();
}

function getSourceLink(addon: RepluggedPlugin | RepluggedTheme): string | undefined {
  const { updater } = addon.manifest;
  if (!updater) return undefined;
  const { type, id } = updater;
  switch (type) {
    case "github":
      return `https://github.com/${id}`;
  }
  return undefined;
}

function openFolder(type: AddonType) {
  getRepluggedNative(type).openFolder();
}

async function loadMissing(type: AddonType) {
  if (type === AddonType.Plugin) {
    const manager = plugins;
    const disabled = manager.getDisabled();
    const existingPlugins = new Set(manager.plugins.keys());
    await manager.loadAll();
    const newPlugins = Array.from(manager.plugins.keys()).filter(
      (x) => !existingPlugins.has(x) && !disabled.includes(x),
    );
    await Promise.all(newPlugins.map((x) => manager.start(x)));
  }
  if (type === AddonType.Theme) {
    const manager = themes;
    const disabled = manager.getDisabled();
    const existingThemes = new Set(manager.themes.keys());
    await manager.loadMissing();
    const newThemes = Array.from(manager.themes.keys()).filter(
      (x) => !existingThemes.has(x) && !disabled.includes(x),
    );
    newThemes.map((x) => manager.load(x));
  }
}

function label(
  type: AddonType,
  {
    caps,
    plural,
  }: { caps?: "lower" | "title" | "upper" | undefined; plural?: boolean | undefined } = {},
) {
  caps ??= "lower";
  plural ??= false;

  let base: string = "";
  if (type === AddonType.Plugin) {
    base = Messages[`REPLUGGED_PLUGIN${plural ? "S" : ""}`];
  }
  if (type === AddonType.Theme) {
    base = Messages[`REPLUGGED_THEME${plural ? "S" : ""}`];
  }
  if (caps === "lower") {
    base = base.toLowerCase();
  }
  if (caps === "upper") {
    base = base.toUpperCase();
  }

  return base;
}

function Authors({ addon }: { addon: RepluggedPlugin | RepluggedTheme }) {
  const els = getAuthors(addon).map((author) => (
    <Flex
      key={JSON.stringify(author)}
      align={Flex.Align.CENTER}
      style={{
        gap: "5px",
        display: "inline-flex",
      }}>
      <b>{author.name}</b>
      {author.discordID ? (
        <Tooltip
          text={Messages.REPLUGGED_ADDON_PROFILE_OPEN.format({
            type: Messages.NOTIFICATION_TITLE_DISCORD,
          })}
          className="replugged-addon-icon replugged-addon-icon-author">
          <a onClick={() => openUserProfile(author.discordID!)}>
            <Icons.Discord />
          </a>
        </Tooltip>
      ) : null}
      {author.github ? (
        <Tooltip
          text={Messages.REPLUGGED_ADDON_PROFILE_OPEN.format({ type: "GitHub" })}
          className="replugged-addon-icon replugged-addon-icon-author">
          <a href={`https://github.com/${author.github}`} target="_blank">
            <Icons.GitHub />
          </a>
        </Tooltip>
      ) : null}
    </Flex>
  ));

  if (els.length === 1) {
    return els[0];
  }
  if (els.length === 2) {
    return (
      <span>
        {els[0]}
        <span style={{ padding: "0 5px" }}>and</span>
        {els[1]}
      </span>
    );
  }
  return (
    <span>
      {els.slice(0, -1).map((x, i) => (
        <React.Fragment key={i}>
          {x}
          <span style={{ paddingRight: "5px" }}>,</span>
        </React.Fragment>
      ))}
      <span style={{ paddingRight: "5px" }}>and</span>
      {els[els.length - 1]}
    </span>
  );
}

function Card({
  type,
  addon,
  disabled,
  hasSettings,
  openSettings,
  toggleDisabled,
  reload,
  uninstall,
}: {
  type: AddonType;
  addon: RepluggedPlugin | RepluggedTheme;
  disabled: boolean;
  hasSettings: boolean;
  openSettings: () => void;
  toggleDisabled: () => void;
  reload: () => void;
  uninstall: () => void;
}) {
  const sourceLink = getSourceLink(addon);

  return (
    <div className="replugged-addon-card">
      <Flex
        align={Flex.Align.START}
        justify={Flex.Justify.BETWEEN}
        style={{ gap: "15px", marginBottom: "15px" }}>
        <span>
          <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
            <Text variant="heading-lg/bold" tag="span">
              {addon.manifest.name}
            </Text>
            <span>
              {" "}
              <b>v{addon.manifest.version}</b> by{" "}
            </span>
            <Authors addon={addon} />
          </Text>
        </span>
        <Flex align={Flex.Align.CENTER} justify={Flex.Justify.END} style={{ gap: "10px" }}>
          {sourceLink ? (
            <Tooltip
              text={Messages.REPLUGGED_ADDON_PAGE_OPEN.format({
                type: label(type, { caps: "title" }),
              })}
              className="replugged-addon-icon">
              <a href={sourceLink} target="_blank">
                <Icons.Link />
              </a>
            </Tooltip>
          ) : null}
          {hasSettings ? (
            <Tooltip
              text={`Open ${label(type, { caps: "title" })} Settings`}
              className="replugged-addon-icon">
              <a onClick={() => openSettings()}>
                <Icons.Settings />
              </a>
            </Tooltip>
          ) : null}
          <Tooltip
            text={Messages.REPLUGGED_ADDON_DELETE.format({ type: label(type, { caps: "title" }) })}
            className="replugged-addon-icon">
            <a onClick={() => uninstall()}>
              <Icons.Trash />
            </a>
          </Tooltip>
          {disabled ? null : (
            <Tooltip
              text={Messages.REPLUGGED_ADDON_RELOAD.format({
                type: label(type, { caps: "title" }),
              })}
              className="replugged-addon-icon">
              <a onClick={() => reload()}>
                <Icons.Reload />
              </a>
            </Tooltip>
          )}
          <Switch checked={!disabled} onChange={toggleDisabled} />
        </Flex>
      </Flex>
      <Text.Normal style={{ margin: "5px 0" }} markdown={true} allowMarkdownLinks={true}>
        {addon.manifest.description}
      </Text.Normal>
    </div>
  );
}

function Cards({
  type,
  disabled,
  setDisabled,
  list,
  refreshList,
}: {
  type: AddonType;
  disabled: Set<string>;
  setDisabled: (disabled: Set<string>) => void;
  list: (RepluggedPlugin | RepluggedTheme)[];
  refreshList: () => void;
}) {
  return (
    <div className="replugged-addon-cards">
      {list.map((addon) => (
        <Card
          type={type}
          addon={addon}
          key={JSON.stringify(addon.manifest)}
          hasSettings={Boolean(getSettingsElement(addon.manifest.id, type))}
          disabled={disabled.has(addon.manifest.id)}
          toggleDisabled={async () => {
            const isDisabled = disabled.has(addon.manifest.id);
            const clonedDisabled = new Set(disabled);
            const manager = getManager(type);
            if (isDisabled) {
              try {
                await manager.enable(addon.manifest.id);
                clonedDisabled.delete(addon.manifest.id);
                toast.toast(
                  Messages.REPLUGGED_TOAST_ADDON_ENABLE_SUCCESS.format({
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error enabling", addon, e);
                toast.toast(
                  Messages.REPLUGGED_TOAST_ADDON_ENABLE_SUCCESS.format({ type: label(type) }),
                  toast.Kind.FAILURE,
                );
              }
            } else {
              try {
                await manager.disable(addon.manifest.id);
                clonedDisabled.add(addon.manifest.id);
                toast.toast(
                  Messages.REPLUGGED_TOAST_ADDON_DISABLE_SUCCESS.format({
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error disabling", addon, e);
                toast.toast(
                  Messages.REPLUGGED_TOAST_ADDON_DISABLE_FAILED.format({ type: label(type) }),
                  toast.Kind.FAILURE,
                );
              }
            }
            setDisabled(clonedDisabled);
          }}
          uninstall={async () => {
            const confirmation = await modal.confirm({
              title: Messages.REPLUGGED_ADDON_UNINSTALL.format({ name: addon.manifest.name }),
              body: Messages.REPLUGGED_ADDON_UNINSTALL_PROMPT_BODY.format({ type: label(type) }),
              confirmText: Messages.APPLICATION_UNINSTALL_PROMPT_CONFIRM,
              cancelText: Messages.CANCEL,
              confirmColor: Button.Colors.RED,
            });
            if (!confirmation) return;

            const manager = getManager(type);
            try {
              await manager.uninstall(addon.manifest.id);
              toast.toast(
                Messages.REPLUGGED_TOAST_ADDON_UNINSTALL_SUCCESS.format({
                  name: addon.manifest.name,
                }),
              );
            } catch (e) {
              logger.error("Error uninstalling", addon, e);
              toast.toast(
                Messages.REPLUGGED_TOAST_ADDON_UNINSTALL_FAILED.format({
                  name: addon.manifest.name,
                }),
                toast.Kind.FAILURE,
              );
            }
            refreshList();
          }}
          reload={async () => {
            const manager = getManager(type);
            try {
              await manager.reload(addon.manifest.id);
              toast.toast(
                Messages.REPLUGGED_TOAST_ADDON_RELOAD_SUCCESS.format({ name: addon.manifest.name }),
              );
            } catch (e) {
              logger.error("Error reloading", addon, e);
              toast.toast(
                Messages.REPLUGGED_TOAST_ADDON_RELOAD_FAILED.format({ name: addon.manifest.name }),
                toast.Kind.FAILURE,
              );
            }
            refreshList();
          }}
          openSettings={() => {
            const element = getSettingsElement(addon.manifest.id, type);
            if (!element) return;

            showAddonSettings(addon, element);
          }}
        />
      ))}
    </div>
  );
}

export const Addons = (type: AddonType) => {
  const [disabled, setDisabled] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const [list, setList] = React.useState<(RepluggedPlugin | RepluggedTheme)[] | null>();
  const [unfilteredCount, setUnfilteredCount] = React.useState(0);

  function refreshList() {
    const list = [...listAddons(type).values()];
    setUnfilteredCount(list.length);
    setList(
      list
        .filter((x) => {
          const props = [
            x.manifest.name,
            x.manifest.id,
            x.manifest.description,
            ...[x.manifest.author].flat().map(Object.values).flat(),
          ].map((x) => x.toLowerCase());

          return props.some((x) => x.includes(search.toLowerCase()));
        })
        .sort((a, b) => a.manifest.name.toLowerCase().localeCompare(b.manifest.name.toLowerCase())),
    );

    setDisabled(new Set(getManager(type).getDisabled()));
  }

  React.useEffect(refreshList, [search]);

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2
          style={{
            // Do not turn "(num)" into a single symbol
            fontVariantLigatures: "none",
          }}>
          {Messages.REPLUGGED_ADDONS_TITLE_COUNT.format({
            type: label(type, { caps: "title", plural: true }),
            count: unfilteredCount,
          })}
        </Text.H2>
        <div style={{ display: "flex" }}>
          <Button onClick={() => openFolder(type)}>
            {Messages.REPLUGGED_ADDONS_FOLDER_OPEN.format({
              type: label(type, { caps: "title", plural: true }),
            })}
          </Button>
          <Button
            onClick={async () => {
              try {
                await loadMissing(type);
                toast.toast(
                  Messages.REPLUGGED_TOAST_ADDONS_LOAD_MISSING_SUCCESS.format({
                    type: label(type, { plural: true }),
                  }),
                );
              } catch (e) {
                logger.error("Error loading missing", e);
                toast.toast(
                  Messages.REPLUGGED_TOAST_ADDONS_LOAD_MISSING_FAILED.format({
                    type: label(type, { plural: true }),
                  }),
                  toast.Kind.FAILURE,
                );
              }

              refreshList();
            }}
            color={Button.Colors.PRIMARY}
            look={Button.Looks.LINK}>
            {Messages.REPLUGGED_ADDONS_LOAD_MISSING.format({
              type: label(type, { caps: "title", plural: true }),
            })}
          </Button>
        </div>
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      {unfilteredCount ? (
        <div style={{ marginBottom: "20px" }}>
          <TextInput
            placeholder={Messages.REPLUGGED_SEARCH_FOR_ADDON.format({ type: label(type) })}
            onChange={(e) => setSearch(e)}
            autoFocus={true}
          />
        </div>
      ) : null}
      {search && list?.length ? (
        <Text variant="heading-md/bold" style={{ marginBottom: "10px" }}>
          {Messages.REPLUGGED_LIST_RESULTS.format({ count: list.length })}
        </Text>
      ) : null}
      {list?.length ? (
        <>
          <Cards
            type={type}
            disabled={disabled}
            setDisabled={setDisabled}
            list={list}
            refreshList={refreshList}
          />
        </>
      ) : list ? (
        <Text variant="heading-lg/bold" style={{ textAlign: "center" }}>
          {unfilteredCount
            ? Messages.REPLUGGED_NO_ADDON_RESULTS.format({ type: label(type, { plural: true }) })
            : Messages.REPLUGGED_NO_ADDONS_INSTALLED.format({
                type: label(type, { plural: true }),
              })}
        </Text>
      ) : null}
    </>
  );
};

export const Plugins = () => Addons(AddonType.Plugin);
export const Themes = () => Addons(AddonType.Theme);
