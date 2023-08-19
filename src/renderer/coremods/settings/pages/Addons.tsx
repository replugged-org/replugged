import { Messages } from "@common/i18n";
import { React, api, fluxDispatcher, modal, toast, users } from "@common";
import {
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
import type { RepluggedPlugin, RepluggedTheme } from "src/types";
import type { AnyAddonManifest, Author } from "src/types/addon";
import "./Addons.css";
import Icons from "../icons";
import { Logger, plugins, themes, webpack } from "@replugged";
import { generalSettings } from "./General";
import { openExternal } from "src/renderer/util";

interface Breadcrumb {
  id: string;
  label: string;
}

interface BreadcrumbProps {
  activeId: string;
  breadcrumbs: Breadcrumb[];
  onBreadcrumbClick: (breadcrumb: Breadcrumb) => void;
  renderCustomBreadcrumb: (breadcrumb: Breadcrumb, active: boolean) => React.ReactNode;
}

const logger = Logger.coremod("AddonSettings");

const Breadcrumbs = webpack.getBySource<React.ComponentClass<BreadcrumbProps>>(
  "().breadcrumbFinalWrapper",
)!;
const BreadcrumbClasses =
  webpack.getByProps<Record<"breadcrumbActive" | "breadcrumbInactive" | "breadcrumbs", string>>(
    "breadcrumbActive",
  )!;

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

function getRepluggedNative(
  type: AddonType,
): typeof window.RepluggedNative.plugins | typeof window.RepluggedNative.themes {
  if (type === AddonType.Plugin) {
    return window.RepluggedNative.plugins;
  }
  if (type === AddonType.Theme) {
    return window.RepluggedNative.themes;
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

function listAddons(type: AddonType): Map<string, RepluggedPlugin> | Map<string, RepluggedTheme> {
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
      const { body } = await api.get({
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

function getAuthors(addon: RepluggedPlugin | RepluggedTheme): Author[] {
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
  getRepluggedNative(type).openFolder();
}

async function loadMissing(type: AddonType): Promise<void> {
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

function Authors({ addon }: { addon: RepluggedPlugin | RepluggedTheme }): React.ReactElement {
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
          <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer">
            <Icons.GitHub />
          </a>
        </Tooltip>
      ) : null}
    </Flex>
  ));

  let message = "";

  if (els.length === 1) {
    // return Messages.REPLUGGED_ADDON_AUTHORS_ONE.format({
    //   author1: els[0],
    // });
    message = Messages.REPLUGGED_ADDON_AUTHORS_ONE.message;
  }
  if (els.length === 2) {
    // return Messages.REPLUGGED_ADDON_AUTHORS_TWO.format({
    //   author1: els[0],
    //   author2: els[1],
    // });
    message = Messages.REPLUGGED_ADDON_AUTHORS_TWO.message;
  }
  if (els.length === 3) {
    // return Messages.REPLUGGED_ADDON_AUTHORS_THREE.format({
    //   author1: els[0],
    //   author2: els[1],
    //   author3: els[2],
    // });

    message = Messages.REPLUGGED_ADDON_AUTHORS_THREE.message;
  }
  if (els.length > 3) {
    // return Messages.REPLUGGED_ADDON_AUTHORS_MANY.format({
    //   author1: els[0],
    //   author2: els[1],
    //   author3: els[2],
    //   count: els.length - 3,
    // });
    message = Messages.REPLUGGED_ADDON_AUTHORS_MANY.message;
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
  addon: RepluggedPlugin | RepluggedTheme;
  disabled: boolean;
  hasSettings: boolean;
  openSettings: () => void;
  toggleDisabled: () => void;
  reload: () => void;
  uninstall: () => void;
}): React.ReactElement {
  const sourceLink = getSourceLink(addon.manifest);

  return (
    <div className="replugged-addon-card">
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
              text={Messages.REPLUGGED_ADDON_PAGE_OPEN.format({
                type: label(type, { caps: "title" }),
              })}
              className="replugged-addon-icon">
              <a href={sourceLink} target="_blank" rel="noopener noreferrer">
                <Icons.Link />
              </a>
            </Tooltip>
          ) : null}
          {hasSettings ? (
            <Tooltip
              text={Messages.REPLUGGED_ADDON_SETTINGS.format({
                type: label(type, { caps: "title" }),
              })}
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
      {addon.manifest.updater?.type !== "store" ? (
        <div style={{ marginTop: "8px" }}>
          <Notice messageType={Notice.Types.ERROR}>
            {Messages.REPLUGGED_ADDON_NOT_REVIEWED_DESC.format({
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
  list: Array<RepluggedPlugin | RepluggedTheme>;
  refreshList: () => void;
}): React.ReactElement {
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
            setSection(`rp_plugin_${addon.manifest.id}`);

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
  const [list, setList] = React.useState<Array<RepluggedPlugin | RepluggedTheme> | null>();
  const [unfilteredCount, setUnfilteredCount] = React.useState(0);
  const [section, setSection] = React.useState(`rp_${type}`);

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
        <Flex align={Flex.Align.CENTER} className={BreadcrumbClasses.breadcrumbs}>
          {section === `rp_${type}` ? (
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
          ) : (
            <Breadcrumbs
              activeId={section.toString()}
              breadcrumbs={[
                {
                  id: `rp_${type}`,
                  label: Messages.REPLUGGED_ADDONS_TITLE_COUNT.format({
                    type: label(type, { caps: "title", plural: true }),
                    count: unfilteredCount,
                  }),
                },
                {
                  id: `rp_${type}_${section.slice(`rp_${type}_`.length)}`,
                  label:
                    list?.filter?.(
                      (x) => x.manifest.id === section.slice(`rp_${type}_`.length),
                    )?.[0]?.manifest?.name || "",
                },
              ]}
              onBreadcrumbClick={(breadcrumb) => setSection(breadcrumb.id)}
              renderCustomBreadcrumb={(breadcrumb, active) => (
                <Text.H2
                  color={active ? "header-primary" : "inherit"}
                  className={
                    active
                      ? BreadcrumbClasses.breadcrumbActive
                      : BreadcrumbClasses.breadcrumbInactive
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
        {section === `rp_${type}` && (
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
            <Button
              onClick={() => openExternal(`${generalSettings.get("apiUrl")}/store/${type}s`)}
              color={Button.Colors.PRIMARY}
              look={Button.Looks.LINK}>
              {Messages.REPLUGGED_ADDON_BROWSE.format({
                type: label(type, { caps: "title", plural: true }),
              })}
            </Button>
          </div>
        )}
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      {section === `rp_${type}` && unfilteredCount ? (
        <div style={{ marginBottom: "20px" }}>
          <TextInput
            placeholder={Messages.REPLUGGED_SEARCH_FOR_ADDON.format({ type: label(type) })}
            onChange={(e) => setSearch(e)}
            autoFocus={true}
          />
        </div>
      ) : null}
      {section === `rp_${type}` && search && list?.length ? (
        <Text variant="heading-md/bold" style={{ marginBottom: "10px" }}>
          {Messages.REPLUGGED_LIST_RESULTS.format({ count: list.length })}
        </Text>
      ) : null}
      {section === `rp_${type}` ? (
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
              ? Messages.REPLUGGED_NO_ADDON_RESULTS.format({ type: label(type, { plural: true }) })
              : Messages.REPLUGGED_NO_ADDONS_INSTALLED.format({
                  type: label(type, { plural: true }),
                })}
          </Text>
        ) : null
      ) : (
        (SettingsElement = getSettingsElement(section.slice(`rp_${type}_`.length), type)) && (
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
