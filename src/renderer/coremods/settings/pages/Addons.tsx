/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { React, contextMenu, marginStyles, modal } from "@common";
import type { ContextMenuProps } from "@common/contextMenu";
import { t as discordT, intl } from "@common/i18n";
import { ToastType, toast } from "@common/toast";
import {
  Anchor,
  Button,
  ContextMenu,
  ErrorBoundary,
  Flex,
  Notice,
  SearchBar,
  Select,
  Stack,
  Switch,
  Text,
  Tooltip,
} from "@components";
import { Logger, plugins, themes, webpack } from "@replugged";
import { generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import { openExternal } from "src/renderer/util";
import type { NodeConfig, RepluggedPlugin, RepluggedTheme } from "src/types";
import type { AnyAddonManifest, Author } from "src/types/addon";
import {
  ClydeIcon,
  GitHubIcon,
  LinkIcon,
  PaintbrushThinIcon,
  PuzzlePieceIcon,
  RefreshIcon,
  SettingsIcon,
  TrashIcon,
} from "../icons";
import {
  createCategory,
  createCustom,
  createNestedPanel,
  createPanel,
  createSidebarItem,
} from "../lib";

import "./Addons.css";

interface OpenUserProfileModalProps {
  userId: string;
  guildId?: string | null;
  channelId?: string;
  messageId?: string;
  roleId?: string;
  sessionId?: string;
  joinRequestId?: string;
  section?: string;
  subsection?: string;
  showGuildProfile?: boolean;
  hideRestrictedProfile?: boolean;
  sourceAnalyticsLocations?: string[];
  appContext?: string;
  customStatusPrompt?: { value: string; label: () => string };
  disableActionsForPreview?: boolean;
}

interface UserProfileModalActionCreators {
  openUserProfileModal: (props: OpenUserProfileModalProps) => Promise<void>;
  closeUserProfileModal: () => void;
}

const logger = Logger.coremod("AddonSettings");

const { openUserProfileModal } =
  await webpack.waitForProps<UserProfileModalActionCreators>("openUserProfileModal");

const { openUserSettings } = await webpack.waitForProps<{
  openUserSettings: (
    key?: string,
    options?: Record<string, unknown>,
    callback?: () => void,
  ) => void;
}>("openUserSettings");

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

function ThemePresetSettings({ id }: { id: string }): React.ReactElement {
  const settings = themes.settings.useValue(id, { chosenPreset: undefined });
  const theme = themes.themes.get(id)!;

  return (
    <Select
      label={intl.string(t.REPLUGGED_ADDON_SETTINGS_THEME_PRESET)}
      options={theme.manifest.presets!.map((preset) => ({
        label: preset.label,
        value: preset.id,
      }))}
      value={settings.chosenPreset || theme.manifest.presets![0].id}
      onChange={(val) => {
        try {
          themes.settings.set(id, { chosenPreset: val });
          if (!themes.getDisabled().includes(id)) {
            themes.reload(id);
          }
          toast(
            intl.formatToPlainString(t.REPLUGGED_TOAST_THEME_PRESET_CHANGED, {
              name: theme.manifest.presets!.find((p) => p.id === val)?.label || val,
            }),
          );
        } catch (error) {
          logger.error("Error changing theme preset", error);
          toast(
            intl.formatToPlainString(t.REPLUGGED_TOAST_THEME_PRESET_FAILED, {
              name: theme.manifest.name,
            }),
            ToastType.FAILURE,
          );
        }
      }}
    />
  );
}

function getSettingsElement(id: string, type: AddonType): React.ComponentType | undefined {
  if (type === AddonType.Plugin) {
    return plugins.getExports(id)?.Settings;
  }
  if (type === AddonType.Theme) {
    if (themes.getDisabled().includes(id)) return undefined;

    const theme = themes.themes.get(id);

    if (theme?.manifest.presets?.length) {
      return () => <ThemePresetSettings id={id} />;
    }
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
    manager.loadMissing();
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
    base = intl.string(t[`REPLUGGED_PLUGIN${plural ? "S" : ""}`]);
  }
  if (type === AddonType.Theme) {
    base = intl.string(t[`REPLUGGED_THEME${plural ? "S" : ""}`]);
  }
  if (caps === "lower") {
    base = base.toLowerCase();
  }
  if (caps === "upper") {
    base = base.toUpperCase();
  }

  return base;
}

function AuthorContextMenu({
  author,
  ...props
}: { author: Author } & ContextMenuProps): React.ReactElement {
  return (
    <ContextMenu.ContextMenu {...props} onClose={contextMenu.close} navId="replugged-addon-authors">
      <ContextMenu.MenuGroup>
        {author.discordID && (
          <ContextMenu.MenuItem
            label={intl.formatToPlainString(t.REPLUGGED_ADDON_PROFILE_OPEN, {
              type: intl.string(discordT.DISCORD),
            })}
            id="replugged-addon-author-discord"
            icon={ClydeIcon}
            action={() => openUserProfileModal({ userId: author.discordID! })}
          />
        )}
        {author.github && (
          <ContextMenu.MenuItem
            label={intl.formatToPlainString(t.REPLUGGED_ADDON_PROFILE_OPEN, {
              type: "GitHub",
            })}
            id="replugged-addon-author-github"
            icon={GitHubIcon}
            action={() => open(`https://github.com/${author.github}`)}
          />
        )}
      </ContextMenu.MenuGroup>
    </ContextMenu.ContextMenu>
  );
}

function Authors({ addon }: { addon: RepluggedPlugin | RepluggedTheme }): React.ReactNode {
  const els = getAuthors(addon).map((author) => (
    <Anchor
      key={JSON.stringify(author)}
      onClick={() => author.discordID && openUserProfileModal({ userId: author.discordID })}
      onContextMenu={(event) => {
        if (!author.github && !author.discordID) return;
        contextMenu.open(event, (props) => <AuthorContextMenu {...props} author={author} />);
      }}>
      <b>{author.name}</b>
    </Anchor>
  ));

  return intl.format(t.REPLUGGED_ADDON_AUTHORS, {
    author1: els[0],
    author2: els[1],
    author3: els[2],
    count: els.length,
    others: els.length - 3,
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
      <Flex
        align={Flex.Align.START}
        justify={Flex.Justify.BETWEEN}
        className={marginStyles.marginBottom4}>
        <span>
          <Text variant="heading-sm/normal" tag="h2" color="text-default">
            <Text variant="heading-md/bold" tag="span" color="text-strong">
              {addon.manifest.name}
            </Text>
            <span>
              {" "}
              <b>v{addon.manifest.version}</b>
            </span>
          </Text>
        </span>
        <Switch checked={!disabled} onChange={toggleDisabled} />
      </Flex>
      <Text.Normal markdown allowMarkdownLinks>
        {addon.manifest.description}
      </Text.Normal>
      {addon.manifest.updater?.type !== "store" ? (
        <Notice messageType={Notice.Types.ERROR} className={marginStyles.marginTop8}>
          {intl.format(t.REPLUGGED_ADDON_NOT_REVIEWED_DESC, {
            type: label(type),
          })}
        </Notice>
      ) : null}
      <Flex className={marginStyles.marginTop8}>
        <Text variant="heading-sm/normal" tag="h2" color="text-default">
          <Authors addon={addon} />
        </Text>
        <Flex align={Flex.Align.CENTER} justify={Flex.Justify.END} style={{ gap: "10px" }}>
          {sourceLink ? (
            <Tooltip
              text={intl.formatToPlainString(t.REPLUGGED_ADDON_PAGE_OPEN, {
                type: label(type, { caps: "title" }),
              })}>
              <Anchor href={sourceLink} className="replugged-addon-icon-container">
                <LinkIcon size="refresh_sm" color="currentColor" className="replugged-addon-icon" />
              </Anchor>
            </Tooltip>
          ) : null}
          {hasSettings ? (
            <Tooltip
              text={intl.formatToPlainString(t.REPLUGGED_ADDON_SETTINGS, {
                type: label(type, { caps: "title" }),
              })}>
              <Anchor onClick={() => openSettings()} className="replugged-addon-icon-container">
                <SettingsIcon
                  size="refresh_sm"
                  color="currentColor"
                  className="replugged-addon-icon"
                />
              </Anchor>
            </Tooltip>
          ) : null}
          <Tooltip
            text={intl.formatToPlainString(t.REPLUGGED_ADDON_DELETE, {
              type: label(type, { caps: "title" }),
            })}>
            <Anchor onClick={() => uninstall()} className="replugged-addon-icon-container">
              <TrashIcon size="refresh_sm" color="currentColor" className="replugged-addon-icon" />
            </Anchor>
          </Tooltip>
          {disabled ? null : (
            <Tooltip
              text={intl.formatToPlainString(t.REPLUGGED_ADDON_RELOAD, {
                type: label(type, { caps: "title" }),
              })}>
              <Anchor onClick={() => reload()} className="replugged-addon-icon-container">
                <RefreshIcon
                  size="refresh_sm"
                  color="currentColor"
                  className="replugged-addon-icon"
                />
              </Anchor>
            </Tooltip>
          )}
        </Flex>
      </Flex>
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
  list: Array<RepluggedPlugin | RepluggedTheme>;
  refreshList: () => void;
}): React.ReactElement {
  return (
    <Stack gap={16}>
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
                toast(
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_ENABLE_SUCCESS, {
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error enabling", addon, e);
                toast(
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_ENABLE_FAILED, {
                    name: label(type),
                  }),
                  ToastType.FAILURE,
                );
              }
            } else {
              try {
                await manager.disable(addon.manifest.id);
                clonedDisabled.add(addon.manifest.id);
                toast(
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_DISABLE_SUCCESS, {
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error disabling", addon, e);
                toast(
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_DISABLE_FAILED, {
                    name: label(type),
                  }),
                  ToastType.FAILURE,
                );
              }
            }
            setDisabled(clonedDisabled);
          }}
          uninstall={async () => {
            const confirmation = await modal.confirm({
              title: intl.format(t.REPLUGGED_ADDON_UNINSTALL, { name: addon.manifest.name }),
              body: intl.format(t.REPLUGGED_ADDON_UNINSTALL_PROMPT_BODY, { type: label(type) }),
              confirmText: intl.string(discordT.APPLICATION_UNINSTALL_PROMPT_CONFIRM),
              cancelText: intl.string(discordT.CANCEL),
            });
            if (!confirmation) return;

            const manager = getManager(type);
            try {
              await manager.uninstall(addon.manifest.id);
              toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_UNINSTALL_SUCCESS, {
                  name: addon.manifest.name,
                }),
              );
            } catch (e) {
              logger.error("Error uninstalling", addon, e);
              toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_UNINSTALL_FAILED, {
                  name: addon.manifest.name,
                }),
                ToastType.FAILURE,
              );
            }
            refreshList();
          }}
          reload={async () => {
            const manager = getManager(type);
            try {
              await manager.reload(addon.manifest.id);
              toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_RELOAD_SUCCESS, {
                  name: addon.manifest.name,
                }),
              );
            } catch (e) {
              logger.error("Error reloading", addon, e);
              toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_RELOAD_FAILED, {
                  name: addon.manifest.name,
                }),
                ToastType.FAILURE,
              );
            }
            refreshList();
          }}
          openSettings={() => {
            openUserSettings(`rp_${type}_nested_panel_${addon.manifest.id}`);
          }}
        />
      ))}
    </Stack>
  );
}

export function useAddonPanelTitle(type: AddonType): string {
  const count = listAddons(type).size;
  return intl.formatToPlainString(t.REPLUGGED_ADDONS_TITLE_COUNT, {
    type: label(type, { caps: "title", plural: true }),
    count,
  });
}

function Addons({ type }: { type: AddonType }): React.ReactElement {
  const [disabled, setDisabled] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const [list, setList] = React.useState<Array<RepluggedPlugin | RepluggedTheme> | null>();
  const [unfilteredCount, setUnfilteredCount] = React.useState(0);

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

  React.useEffect(refreshList, [search, type]);

  return (
    <Stack gap={16}>
      <Stack justify="space-between" direction="horizontal">
        <Button fullWidth onClick={() => openFolder(type)}>
          {intl.format(t.REPLUGGED_ADDONS_FOLDER_OPEN, {
            type: label(type, { caps: "title", plural: true }),
          })}
        </Button>
        <Button
          fullWidth
          onClick={async () => {
            try {
              await loadMissing(type);
              toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDONS_LOAD_MISSING_SUCCESS, {
                  type: label(type, { plural: true }),
                }),
              );
            } catch (e) {
              logger.error("Error loading missing", e);
              toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDONS_LOAD_MISSING_FAILED, {
                  type: label(type, { plural: true }),
                }),
                ToastType.FAILURE,
              );
            }

            refreshList();
          }}
          color={Button.Colors.PRIMARY}
          look={Button.Looks.OUTLINED}>
          {intl.format(t.REPLUGGED_ADDONS_LOAD_MISSING, {
            type: label(type, { caps: "title", plural: true }),
          })}
        </Button>
        <Button
          fullWidth
          onClick={() => openExternal(`${generalSettings.get("apiUrl")}/store/${type}s`)}
          color={Button.Colors.PRIMARY}
          look={Button.Looks.OUTLINED}>
          {intl.format(t.REPLUGGED_ADDON_BROWSE, {
            type: label(type, { caps: "title", plural: true }),
          })}
        </Button>
      </Stack>
      {unfilteredCount ? (
        <SearchBar
          query={search}
          onChange={(query) => setSearch(query)}
          onClear={() => setSearch("")}
          placeholder={intl.formatToPlainString(t.REPLUGGED_SEARCH_FOR_ADDON, {
            type: label(type),
          })}
          autoFocus
        />
      ) : null}
      {search && list?.length ? (
        <Text variant="heading-md/bold" className={marginStyles.marginBottom8}>
          {intl.format(t.REPLUGGED_LIST_RESULTS, { count: list.length })}
        </Text>
      ) : null}
      {list?.length ? (
        <Cards
          type={type}
          disabled={disabled}
          setDisabled={setDisabled}
          list={list}
          refreshList={refreshList}
        />
      ) : list ? (
        <Text variant="heading-lg/bold" style={{ textAlign: "center" }}>
          {unfilteredCount
            ? intl.format(t.REPLUGGED_NO_ADDON_RESULTS, { type: label(type, { plural: true }) })
            : intl.format(t.REPLUGGED_NO_ADDONS_INSTALLED, {
                type: label(type, { plural: true }),
              })}
        </Text>
      ) : null}
    </Stack>
  );
}

/**
 * Creates a nested panel for addon settings.
 *
 * The navigator nodes are physically hidden from the settings list via a plaintext patch on the nested panel renderer,
 * but they remain "accessible" in the settings directory structure, allowing us to open them via the user settings action.
 */
function createAddonSettingsNestedPanel(
  addon: RepluggedPlugin | RepluggedTheme,
  type: AddonType,
): NodeConfig {
  const addonId = addon.manifest.id;

  return createNestedPanel(`rp_${type}_nested_panel_${addonId}`, {
    buildLayout: () => [
      createPanel(`rp_${type}_panel_${addonId}`, {
        useTitle: () => addon.manifest.name,
        buildLayout: () => [
          createCategory(`rp_${type}_category_${addonId}`, {
            buildLayout: () => [
              createCustom(`rp_${type}_custom_${addonId}`, {
                Component: () => {
                  const Settings = getSettingsElement(addonId, type);
                  return Settings ? (
                    <ErrorBoundary>
                      <Settings />
                    </ErrorBoundary>
                  ) : null;
                },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createAddonSidebarItem(type: AddonType): NodeConfig {
  const pluralType = `${type}s`;
  const isPlugin = type === AddonType.Plugin;
  const icon = isPlugin ? PuzzlePieceIcon : PaintbrushThinIcon;
  const title = isPlugin ? t.REPLUGGED_PLUGINS : t.REPLUGGED_THEMES;

  const node = createCustom(`${pluralType}_custom`, {
    Component: () => <Addons type={type} />,
  });

  const category = createCategory(`${pluralType}_category`, {
    buildLayout: () => {
      const addons = [...listAddons(type).values()];
      const addonSettingsNestedPanels = addons
        .filter((addon) => Boolean(getSettingsElement(addon.manifest.id, type)))
        .map((addon) => createAddonSettingsNestedPanel(addon, type));

      return [node, ...addonSettingsNestedPanels];
    },
  });

  const panel = createPanel(`${pluralType}_panel`, {
    useTitle: () => useAddonPanelTitle(type),
    buildLayout: () => [category],
  });

  return createSidebarItem(`${pluralType}_sidebar_item`, {
    icon,
    useTitle: () => intl.string(title),
    buildLayout: () => [panel],
  });
}

export const PluginsSidebarItem = createAddonSidebarItem(AddonType.Plugin);
export const ThemesSidebarItem = createAddonSidebarItem(AddonType.Theme);
