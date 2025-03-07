/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { React, api, fluxDispatcher, i18n, modal, toast, users } from "@common";
import {
  Breadcrumb,
  Button,
  Divider,
  ErrorBoundary,
  Flex,
  Notice,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from "@components";
import { Logger, plugins, themes } from "@recelled";
import { t } from "src/renderer/modules/i18n";
import { openExternal } from "src/renderer/util";
import type { ReCelledPlugin, ReCelledTheme } from "src/types";
import type { AnyAddonManifest, Author } from "src/types/addon";
import Icons from "../icons";
import { generalSettings } from "./General";

import "./Addons.css";

const logger = Logger.coremod("AddonSettings");

const { t: discordT, intl } = i18n;

export enum AddonType {
  Plugin = "plugin",
  Theme = "theme",
}

export function getAddonType(type: "replugged-plugin" | "replugged-theme"): AddonType {
  if (type === "replugged-plugin") {
    return AddonType.Plugin;
  }
  if (type === "replugged-theme") {
    return AddonType.Theme;
  }
  throw new Error("Invalid addon type");
}

function getReCelledNative(
  type: AddonType,
): typeof window.ReCelledNative.plugins | typeof window.ReCelledNative.themes {
  if (type === AddonType.Plugin) {
    return window.ReCelledNative.plugins;
  }
  if (type === AddonType.Theme) {
    return window.ReCelledNative.themes;
  }
  throw new Error("Invalid addon type");
}

function getManager(type: AddonType): typeof plugins | typeof themes {
  if (type === AddonType.Plugin) {
    return plugins;
  }
  if (type === AddonType.Theme) {
    return themes;
  }
  throw new Error("Invalid addon type");
}

function getSettingsElement(id: string, type: AddonType): React.ComponentType | undefined {
  if (type === AddonType.Plugin) {
    return plugins.getExports(id)?.Settings;
  }
  if (type === AddonType.Theme) {
    return undefined;
  }

  throw new Error("Invalid addon type");
}

function listAddons(type: AddonType): Map<string, ReCelledPlugin> | Map<string, ReCelledTheme> {
  if (type === AddonType.Plugin) {
    return plugins.plugins;
  }
  if (type === AddonType.Theme) {
    return themes.themes;
  }
  throw new Error("Invalid addon type");
}

async function openUserProfile(id: string): Promise<void> {
  if (!users.getUser(id)) {
    try {
      const { body } = await api.HTTP.get({
        url: `/users/${id}/profile`,
        query: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          with_mutual_friends_count: "true",

          // eslint-disable-next-line @typescript-eslint/naming-convention
          with_mutual_guilds: "true",
        },
      });
      fluxDispatcher.dispatch({ type: "USER_UPDATE", user: body.user });
      fluxDispatcher.dispatch({ type: "USER_PROFILE_FETCH_SUCCESS", ...body });
    } catch {
      try {
        const { body } = await api.HTTP.get({
          url: `/users/${id}`,
        });
        fluxDispatcher.dispatch({ type: "USER_UPDATE", user: body });
      } catch (e) {
        logger.error(`Failed to fetch user profile for ${id}`, e);
        toast.toast(intl.string(t.RECELLED_TOAST_PROFILE_FETCH_FAILED), toast.Kind.FAILURE);
        return;
      }
    }
  }
  fluxDispatcher.dispatch({
    type: "USER_PROFILE_MODAL_OPEN",
    userId: id,
  });
}

function getAuthors(addon: ReCelledPlugin | ReCelledTheme): Author[] {
  return [addon.manifest.author].flat();
}

export function getSourceLink(addon: AnyAddonManifest): string | undefined {
  const { id: addonId, updater } = addon;
  if (!updater) return undefined;
  const { type, id: updaterId } = updater;
  switch (type) {
    case "github":
      return `https://github.com/${updaterId}`;
    case "store":
      return `${generalSettings.get("apiUrl")}/store/${addonId}`;
  }
  return undefined;
}

function openFolder(type: AddonType): void {
  getReCelledNative(type).openFolder();
}

async function loadMissing(type: AddonType): Promise<void> {
  if (type === AddonType.Plugin) {
    const manager = plugins;
    const disabled = manager.getDisabled();
    const existingPlugins = new Set(manager.plugins.keys());
    manager.loadAll();
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

export function label(
  type: AddonType,
  {
    caps,
    plural,
  }: { caps?: "lower" | "title" | "upper" | undefined; plural?: boolean | undefined } = {},
): string {
  caps ??= "lower";
  plural ??= false;

  let base = "";
  if (type === AddonType.Plugin) {
    base = intl.string(t[`RECELLED_PLUGIN${plural ? "S" : ""}`]);
  }
  if (type === AddonType.Theme) {
    base = intl.string(t[`RECELLED_THEME${plural ? "S" : ""}`]);
  }
  if (caps === "lower") {
    base = base.toLowerCase();
  }
  if (caps === "upper") {
    base = base.toUpperCase();
  }

  return base;
}

function replaceVariable(
  str: string,
  variables: Record<string, React.ReactElement | string>,
): React.ReactElement {
  const els: Array<React.ReactElement | string> = [];
  let last = 0;
  for (const [match, el] of Object.entries(variables)) {
    const index = str.indexOf(`{${match}}`, last);
    if (index === -1) continue;
    els.push(<>{str.slice(last, index)}</>);
    els.push(el);
    last = index + match.length + 2;
  }
  els.push(<>{str.slice(last)}</>);
  return <>{els}</>;
}

function Authors({ addon }: { addon: ReCelledPlugin | ReCelledTheme }): React.ReactElement {
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
          text={intl.formatToPlainString(t.RECELLED_ADDON_PROFILE_OPEN, {
            type: intl.string(discordT.NOTIFICATION_TITLE_DISCORD),
          })}
          className="recelled-addon-icon recelled-addon-icon-author">
          <a onClick={() => openUserProfile(author.discordID!)}>
            <Icons.Discord />
          </a>
        </Tooltip>
      ) : null}
      {author.github ? (
        <Tooltip
          text={intl.formatToPlainString(t.RECELLED_ADDON_PROFILE_OPEN, { type: "GitHub" })}
          className="recelled-addon-icon recelled-addon-icon-author">
          <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer">
            <Icons.GitHub />
          </a>
        </Tooltip>
      ) : null}
    </Flex>
  ));

  let message = "";

  if (els.length === 1) {
    // @ts-expect-error We replace the variables with replaceVariable later
    message = intl.string(t.RECELLED_ADDON_AUTHORS_ONE);
  }
  if (els.length === 2) {
    // @ts-expect-error We replace the variables with replaceVariable later
    message = intl.string(t.RECELLED_ADDON_AUTHORS_TWO);
  }
  if (els.length === 3) {
    // @ts-expect-error We replace the variables with replaceVariable later
    message = intl.string(t.RECELLED_ADDON_AUTHORS_THREE);
  }
  if (els.length > 3) {
    // @ts-expect-error We replace the variables with replaceVariable later
    message = intl.string(t.RECELLED_ADDON_AUTHORS_MANY);
  }

  return replaceVariable(message, {
    author1: els[0],
    author2: els[1],
    author3: els[2],
    count: (els.length - 3).toString(),
  });
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
  addon: ReCelledPlugin | ReCelledTheme;
  disabled: boolean;
  hasSettings: boolean;
  openSettings: () => void;
  toggleDisabled: () => void;
  reload: () => void;
  uninstall: () => void;
}): React.ReactElement {
  const sourceLink = getSourceLink(addon.manifest);

  return (
    <div className="recelled-addon-card replugged-addon-card">
      <Flex align={Flex.Align.START} justify={Flex.Justify.BETWEEN} style={{ marginBottom: "5px" }}>
        <span>
          <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
            <Text variant="heading-md/bold" tag="span" color="header-primary">
              {addon.manifest.name}
            </Text>
            <span>
              {" "}
              <b>v{addon.manifest.version}</b>
            </span>{" "}
            <Authors addon={addon} />
          </Text>
        </span>
        <Flex align={Flex.Align.CENTER} justify={Flex.Justify.END} style={{ gap: "10px" }}>
          {sourceLink ? (
            <Tooltip
              text={intl.formatToPlainString(t.RECELLED_ADDON_PAGE_OPEN, {
                type: label(type, { caps: "title" }),
              })}
              className="recelled-addon-icon replugged-addon-icon">
              <a href={sourceLink} target="_blank" rel="noopener noreferrer">
                <Icons.Link />
              </a>
            </Tooltip>
          ) : null}
          {hasSettings ? (
            <Tooltip
              text={intl.formatToPlainString(t.RECELLED_ADDON_SETTINGS, {
                type: label(type, { caps: "title" }),
              })}
              className="recelled-addon-icon replugged-addon-icon">
              <a onClick={() => openSettings()}>
                <Icons.Settings />
              </a>
            </Tooltip>
          ) : null}
          <Tooltip
            text={intl.formatToPlainString(t.RECELLED_ADDON_DELETE, {
              type: label(type, { caps: "title" }),
            })}
            className="recelled-addon-icon replugged-addon-icon">
            <a onClick={() => uninstall()}>
              <Icons.Trash />
            </a>
          </Tooltip>
          {disabled ? null : (
            <Tooltip
              text={intl.formatToPlainString(t.RECELLED_ADDON_RELOAD, {
                type: label(type, { caps: "title" }),
              })}
              className="recelled-addon-icon replugged-addon-icon">
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
      {addon.manifest.updater?.type !== "store" ? (
        <div style={{ marginTop: "8px" }}>
          <Notice messageType={Notice.Types.ERROR}>
            {intl.format(t.RECELLED_ADDON_NOT_REVIEWED_DESC, {
              type: label(type),
            })}
          </Notice>
        </div>
      ) : null}
    </div>
  );
}

function Cards({
  type,
  disabled,
  setSection,
  setDisabled,
  list,
  refreshList,
}: {
  type: AddonType;
  disabled: Set<string>;
  setSection: (section: string) => void;
  setDisabled: (disabled: Set<string>) => void;
  list: Array<ReCelledPlugin | ReCelledTheme>;
  refreshList: () => void;
}): React.ReactElement {
  return (
    <div className="recelled-addon-cards replugged-addon-cards">
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
                  intl.formatToPlainString(t.RECELLED_TOAST_ADDON_ENABLE_SUCCESS, {
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error enabling", addon, e);
                toast.toast(
                  intl.formatToPlainString(t.RECELLED_TOAST_ADDON_ENABLE_FAILED, {
                    name: label(type),
                  }),
                  toast.Kind.FAILURE,
                );
              }
            } else {
              try {
                await manager.disable(addon.manifest.id);
                clonedDisabled.add(addon.manifest.id);
                toast.toast(
                  intl.formatToPlainString(t.RECELLED_TOAST_ADDON_DISABLE_SUCCESS, {
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error disabling", addon, e);
                toast.toast(
                  intl.formatToPlainString(t.RECELLED_TOAST_ADDON_DISABLE_FAILED, {
                    name: label(type),
                  }),
                  toast.Kind.FAILURE,
                );
              }
            }
            setDisabled(clonedDisabled);
          }}
          uninstall={async () => {
            const confirmation = await modal.confirm({
              title: intl.format(t.RECELLED_ADDON_UNINSTALL, { name: addon.manifest.name }),
              body: intl.format(t.RECELLED_ADDON_UNINSTALL_PROMPT_BODY, { type: label(type) }),
              confirmText: intl.string(discordT.APPLICATION_UNINSTALL_PROMPT_CONFIRM),
              cancelText: intl.string(discordT.CANCEL),
              confirmColor: Button.Colors.RED,
            });
            if (!confirmation) return;

            const manager = getManager(type);
            try {
              await manager.uninstall(addon.manifest.id);
              toast.toast(
                intl.formatToPlainString(t.RECELLED_TOAST_ADDON_UNINSTALL_SUCCESS, {
                  name: addon.manifest.name,
                }),
              );
            } catch (e) {
              logger.error("Error uninstalling", addon, e);
              toast.toast(
                intl.formatToPlainString(t.RECELLED_TOAST_ADDON_UNINSTALL_FAILED, {
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
                intl.formatToPlainString(t.RECELLED_TOAST_ADDON_RELOAD_SUCCESS, {
                  name: addon.manifest.name,
                }),
              );
            } catch (e) {
              logger.error("Error reloading", addon, e);
              toast.toast(
                intl.formatToPlainString(t.RECELLED_TOAST_ADDON_RELOAD_FAILED, {
                  name: addon.manifest.name,
                }),
                toast.Kind.FAILURE,
              );
            }
            refreshList();
          }}
          openSettings={() => {
            setSection(`rc_plugin_${addon.manifest.id}`);

            document.querySelector('div[class^="contentRegionScroller"]')!.scrollTo({ top: 0 });
          }}
        />
      ))}
    </div>
  );
}

export const Addons = (type: AddonType): React.ReactElement => {
  const [disabled, setDisabled] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const [list, setList] = React.useState<Array<ReCelledPlugin | ReCelledTheme> | null>();
  const [unfilteredCount, setUnfilteredCount] = React.useState(0);
  const [section, setSection] = React.useState(`rc_${type}`);

  let SettingsElement: React.ComponentType | undefined;

  function refreshList(): void {
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
        <Flex
          align={Flex.Align.CENTER}
          className={"recelled-addon-breadcrumbs replugged-addon-breadcrumbs"}>
          {section === `rc_${type}` ? (
            <Text.H2
              style={{
                // Do not turn "(num)" into a single symbol
                fontVariantLigatures: "none",
              }}>
              {intl.format(t.RECELLED_ADDONS_TITLE_COUNT, {
                type: label(type, { caps: "title", plural: true }),
                count: unfilteredCount,
              })}
            </Text.H2>
          ) : (
            <Breadcrumb
              activeId={section.toString()}
              breadcrumbs={[
                {
                  id: `rc_${type}`,
                  label: intl.formatToPlainString(t.RECELLED_ADDONS_TITLE_COUNT, {
                    type: label(type, { caps: "title", plural: true }),
                    count: unfilteredCount,
                  }),
                },
                {
                  id: `rc_${type}_${section.slice(`rc_${type}_`.length)}`,
                  label:
                    list?.filter?.(
                      (x) => x.manifest.id === section.slice(`rc_${type}_`.length),
                    )?.[0]?.manifest.name || "",
                },
              ]}
              onBreadcrumbClick={(breadcrumb) => setSection(breadcrumb.id)}
              renderCustomBreadcrumb={(breadcrumb, active) => (
                <Text.H2
                  color={active ? "header-primary" : "inherit"}
                  className={
                    active
                      ? "recelled-addon-breadcrumbsActive replugged-addon-breadcrumbsActive"
                      : "recelled-addon-breadcrumbsInactive replugged-addon-breadcrumbsInactive"
                  }
                  style={{
                    // Do not turn "(num)" into a single symbol
                    fontVariantLigatures: "none",
                  }}>
                  {breadcrumb.label}
                </Text.H2>
              )}
            />
          )}
        </Flex>
        {section === `rc_${type}` && (
          <div style={{ display: "flex" }}>
            <Button onClick={() => openFolder(type)}>
              {intl.format(t.RECELLED_ADDONS_FOLDER_OPEN, {
                type: label(type, { caps: "title", plural: true }),
              })}
            </Button>
            <Button
              onClick={async () => {
                try {
                  await loadMissing(type);
                  toast.toast(
                    intl.formatToPlainString(t.RECELLED_TOAST_ADDONS_LOAD_MISSING_SUCCESS, {
                      type: label(type, { plural: true }),
                    }),
                  );
                } catch (e) {
                  logger.error("Error loading missing", e);
                  toast.toast(
                    intl.formatToPlainString(t.RECELLED_TOAST_ADDONS_LOAD_MISSING_FAILED, {
                      type: label(type, { plural: true }),
                    }),
                    toast.Kind.FAILURE,
                  );
                }

                refreshList();
              }}
              color={Button.Colors.PRIMARY}
              look={Button.Looks.LINK}>
              {intl.format(t.RECELLED_ADDONS_LOAD_MISSING, {
                type: label(type, { caps: "title", plural: true }),
              })}
            </Button>
            <Button
              onClick={() => openExternal(`${generalSettings.get("apiUrl")}/store/${type}s`)}
              color={Button.Colors.PRIMARY}
              look={Button.Looks.LINK}>
              {intl.format(t.RECELLED_ADDON_BROWSE, {
                type: label(type, { caps: "title", plural: true }),
              })}
            </Button>
          </div>
        )}
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      {section === `rc_${type}` && unfilteredCount ? (
        <div style={{ marginBottom: "20px" }}>
          <TextInput
            placeholder={intl.formatToPlainString(t.RECELLED_SEARCH_FOR_ADDON, {
              type: label(type),
            })}
            onChange={(e) => setSearch(e)}
            autoFocus={true}
          />
        </div>
      ) : null}
      {section === `rc_${type}` && search && list?.length ? (
        <Text variant="heading-md/bold" style={{ marginBottom: "10px" }}>
          {intl.format(t.RECELLED_LIST_RESULTS, { count: list.length })}
        </Text>
      ) : null}
      {section === `rc_${type}` ? (
        list?.length ? (
          <>
            <Cards
              type={type}
              disabled={disabled}
              setSection={setSection}
              setDisabled={setDisabled}
              list={list}
              refreshList={refreshList}
            />
          </>
        ) : list ? (
          <Text variant="heading-lg/bold" style={{ textAlign: "center" }}>
            {unfilteredCount
              ? intl.format(t.RECELLED_NO_ADDON_RESULTS, { type: label(type, { plural: true }) })
              : intl.format(t.RECELLED_NO_ADDONS_INSTALLED, {
                  type: label(type, { plural: true }),
                })}
          </Text>
        ) : null
      ) : (
        (SettingsElement = getSettingsElement(section.slice(`rc_${type}_`.length), type)) && (
          <ErrorBoundary>
            <SettingsElement />
          </ErrorBoundary>
        )
      )}
    </>
  );
};

export const Plugins = (): React.ReactElement => Addons(AddonType.Plugin);
export const Themes = (): React.ReactElement => Addons(AddonType.Theme);
