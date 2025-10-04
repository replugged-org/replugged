/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { React, contextMenu, marginStyles, modal, toast } from "@common";
import type { ContextMenuProps } from "@common/contextMenu";
import { t as discordT, intl } from "@common/i18n";
import {
  Anchor,
  Breadcrumbs,
  Button,
  ContextMenu,
  ErrorBoundary,
  Flex,
  FormSection,
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
import type { RepluggedPlugin, RepluggedTheme } from "src/types";
import type { AnyAddonManifest, Author } from "src/types/addon";
import Icons from "../icons";

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
        value: preset.path,
      }))}
      value={settings.chosenPreset || theme.manifest.presets![0].path}
      onChange={(val) => {
        try {
          themes.settings.set(id, { chosenPreset: val });
          if (!themes.getDisabled().includes(id)) {
            themes.reload(id);
          }
          toast.toast(
            intl.formatToPlainString(t.REPLUGGED_TOAST_THEME_PRESET_CHANGED, {
              name: theme.manifest.presets!.find((p) => p.path === val)?.label || val,
            }),
          );
        } catch (error) {
          logger.error("Error changing theme preset", error);
          toast.toast(
            intl.formatToPlainString(t.REPLUGGED_TOAST_THEME_PRESET_FAILED, {
              name: theme.manifest.name,
            }),
            toast.Kind.FAILURE,
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

    const theme = themes.themes.get(id)!;

    if (theme.manifest.presets?.length) {
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
            icon={Icons.Discord}
            action={() => openUserProfileModal({ userId: author.discordID! })}
          />
        )}
        {author.github && (
          <ContextMenu.MenuItem
            label={intl.formatToPlainString(t.REPLUGGED_ADDON_PROFILE_OPEN, {
              type: "GitHub",
            })}
            id="replugged-addon-author-github"
            icon={Icons.GitHub}
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
    count: els.length.toString(),
    others: (els.length - 3).toString(),
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
          <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
            <Text variant="heading-md/bold" tag="span" color="header-primary">
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
        <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
          <Authors addon={addon} />
        </Text>
        <Flex align={Flex.Align.CENTER} justify={Flex.Justify.END} style={{ gap: "10px" }}>
          {sourceLink ? (
            <Tooltip
              text={intl.formatToPlainString(t.REPLUGGED_ADDON_PAGE_OPEN, {
                type: label(type, { caps: "title" }),
              })}
              className="replugged-addon-icon">
              <Anchor href={sourceLink}>
                <Icons.Link />
              </Anchor>
            </Tooltip>
          ) : null}
          {hasSettings ? (
            <Tooltip
              text={intl.formatToPlainString(t.REPLUGGED_ADDON_SETTINGS, {
                type: label(type, { caps: "title" }),
              })}
              className="replugged-addon-icon">
              <Anchor onClick={() => openSettings()}>
                <Icons.Settings />
              </Anchor>
            </Tooltip>
          ) : null}
          <Tooltip
            text={intl.formatToPlainString(t.REPLUGGED_ADDON_DELETE, {
              type: label(type, { caps: "title" }),
            })}
            className="replugged-addon-icon">
            <Anchor onClick={() => uninstall()}>
              <Icons.Trash />
            </Anchor>
          </Tooltip>
          {disabled ? null : (
            <Tooltip
              text={intl.formatToPlainString(t.REPLUGGED_ADDON_RELOAD, {
                type: label(type, { caps: "title" }),
              })}
              className="replugged-addon-icon">
              <Anchor onClick={() => reload()}>
                <Icons.Reload />
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
                toast.toast(
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_ENABLE_SUCCESS, {
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error enabling", addon, e);
                toast.toast(
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_ENABLE_FAILED, {
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
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_DISABLE_SUCCESS, {
                    name: addon.manifest.name,
                  }),
                );
              } catch (e) {
                logger.error("Error disabling", addon, e);
                toast.toast(
                  intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_DISABLE_FAILED, {
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
              title: intl.format(t.REPLUGGED_ADDON_UNINSTALL, { name: addon.manifest.name }),
              body: intl.format(t.REPLUGGED_ADDON_UNINSTALL_PROMPT_BODY, { type: label(type) }),
              confirmText: intl.string(discordT.APPLICATION_UNINSTALL_PROMPT_CONFIRM),
              cancelText: intl.string(discordT.CANCEL),
              confirmColor: Button.Colors.RED,
            });
            if (!confirmation) return;

            const manager = getManager(type);
            try {
              await manager.uninstall(addon.manifest.id);
              toast.toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_UNINSTALL_SUCCESS, {
                  name: addon.manifest.name,
                }),
              );
            } catch (e) {
              logger.error("Error uninstalling", addon, e);
              toast.toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_UNINSTALL_FAILED, {
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
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_RELOAD_SUCCESS, {
                  name: addon.manifest.name,
                }),
              );
            } catch (e) {
              logger.error("Error reloading", addon, e);
              toast.toast(
                intl.formatToPlainString(t.REPLUGGED_TOAST_ADDON_RELOAD_FAILED, {
                  name: addon.manifest.name,
                }),
                toast.Kind.FAILURE,
              );
            }
            refreshList();
          }}
          openSettings={() => {
            setSection(`rp_${type}_${addon.manifest.id}`);

            document.querySelector('div[class^="contentRegionScroller"]')!.scrollTo({ top: 0 });
          }}
        />
      ))}
    </Stack>
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

  React.useEffect(refreshList, [search, type]);

  function getAddonIdFromSection(section: string): string {
    const prefix = `rp_${type}_`;
    return section.startsWith(prefix) ? section.slice(prefix.length) : section;
  }

  return (
    <FormSection
      tag="h1"
      title={
        <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
          {section === `rp_${type}` ? (
            <Text.H2
              style={{
                // Do not turn "(num)" into a single symbol
                fontVariantLigatures: "none",
              }}>
              {intl.format(t.REPLUGGED_ADDONS_TITLE_COUNT, {
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
                  label: intl.formatToPlainString(t.REPLUGGED_ADDONS_TITLE_COUNT, {
                    type: label(type, { caps: "title", plural: true }),
                    count: unfilteredCount,
                  }),
                },
                {
                  id: `rp_${type}_${getAddonIdFromSection(section)}`,
                  label:
                    list?.find((x) => x.manifest.id === getAddonIdFromSection(section))?.manifest
                      .name || "",
                },
              ]}
              onBreadcrumbClick={(breadcrumb) => setSection(breadcrumb.id)}
              renderCustomBreadcrumb={(breadcrumb, active) => (
                <Text.H2
                  color={active ? "header-primary" : "inherit"}
                  className={
                    active
                      ? "replugged-addon-breadcrumbsActive"
                      : "replugged-addon-breadcrumbsInactive"
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
      }>
      <Stack gap={16}>
        {section === `rp_${type}` && (
          // TODO: Replace with ButtonGroup from Mana Design System; after Button has been migrated as well
          <Stack gap={8} justify="space-between" direction="horizontal">
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
                  toast.toast(
                    intl.formatToPlainString(t.REPLUGGED_TOAST_ADDONS_LOAD_MISSING_SUCCESS, {
                      type: label(type, { plural: true }),
                    }),
                  );
                } catch (e) {
                  logger.error("Error loading missing", e);
                  toast.toast(
                    intl.formatToPlainString(t.REPLUGGED_TOAST_ADDONS_LOAD_MISSING_FAILED, {
                      type: label(type, { plural: true }),
                    }),
                    toast.Kind.FAILURE,
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
        )}
        {section === `rp_${type}` && unfilteredCount ? (
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
        {section === `rp_${type}` && search && list?.length ? (
          <Text variant="heading-md/bold" className={marginStyles.marginBottom8}>
            {intl.format(t.REPLUGGED_LIST_RESULTS, { count: list.length })}
          </Text>
        ) : null}
        {section === `rp_${type}` ? (
          list?.length ? (
            <Cards
              type={type}
              disabled={disabled}
              setSection={setSection}
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
          ) : null
        ) : (
          (SettingsElement = getSettingsElement(getAddonIdFromSection(section), type)) && (
            <ErrorBoundary>
              <SettingsElement />
            </ErrorBoundary>
          )
        )}
      </Stack>
    </FormSection>
  );
};

export const Plugins = (): React.ReactElement => Addons(AddonType.Plugin);
export const Themes = (): React.ReactElement => Addons(AddonType.Theme);
