import { plugins, themes } from "@replugged";
import { waitForProps } from "@webpack";
import { ContextMenu } from "@components";
import { React } from "@common";
import { t as discordT, intl } from "@common/i18n";
import { t } from "src/renderer/modules/i18n";
import { generalSettings } from "src/renderer/managers/settings";

import type { MenuProps } from "discord-client-types/discord_app/design/components/Menu/web/Menu";
import type { RepluggedPlugin, RepluggedTheme } from "src/types";

interface UserSettingUtils {
  USER_SETTINGS_MODAL_KEY: "USER_SETTINGS_MODAL_MODAL_KEY";
  getUserSettingsSectionsByWebUserSettings: () => Map<string, string>;
  getWebUserSettingsByUserSettingsSections: () => Map<string, string>;
  openUserSettings: (key: string, analytics?: Record<string, unknown>) => Promise<void>;
  openUserSettingsFromParsedUrl: (parsedUrl: {
    match: {
      params: Record<string, unknown>;
      section: string;
      subsection?: string;
    };
    urlOrigin: string;
    analyticsLocations?: Record<string, unknown>;
  }) => void;
}

const UserSettingUtils = await waitForProps<UserSettingUtils>(
  "openUserSettings",
  "openUserSettingsFromParsedUrl",
);

function MapAddonMenuItems(
  addons: Map<string, RepluggedTheme> | Map<string, RepluggedPlugin>,
  manager: typeof plugins | typeof themes,
): React.ReactElement[] {
  const disabled = manager.getDisabled();
  return [...addons.values()]
    .sort((a, b) => a.manifest.name.toLowerCase().localeCompare(b.manifest.name.toLowerCase()))
    .map(({ path, manifest }) => {
      const [enabled, setEnabled] = React.useState(!disabled.includes(manifest.id));
      return (
        <ContextMenu.MenuCheckboxItem
          key={path}
          id={manifest.id}
          label={manifest.name}
          checked={enabled}
          action={async () => {
            if (enabled) await manager.disable(manifest.id);
            else await manager.enable(manifest.id);
            setEnabled((p) => !p);
          }}
        />
      );
    });
}

export default (_data: unknown, menu: MenuProps): void => {
  const quickCss = generalSettings.useValue("quickCSS");
  const { MenuItem, MenuCheckboxItem } = ContextMenu;
  if (!Array.isArray(menu.children) || !Array.isArray(menu.children[0])) return;

  const menuItems = menu.children[0];
  const index = menuItems.findIndex((c) => c.key === "Billing");

  menuItems.splice(
    index + 1,
    0,
    <>
      <MenuItem
        id="replugged-configuration"
        label={intl.string(discordT.SETTINGS_GENERAL)}
        action={() => UserSettingUtils.openUserSettings("replugged-general")}>
        <MenuCheckboxItem
          id="replugged-general-quickcss"
          label={intl.string(t.REPLUGGED_QUICKCSS)}
          checked={quickCss}
          action={() => generalSettings.set("quickCSS", !quickCss)}
        />
      </MenuItem>
      {quickCss && (
        <MenuItem
          id="replugged-quick-css"
          label={intl.string(t.REPLUGGED_QUICKCSS)}
          action={() => UserSettingUtils.openUserSettings("replugged-quick-css")}
        />
      )}
      <MenuItem
        id="replugged-plugins"
        label={intl.string(t.REPLUGGED_PLUGINS)}
        action={() => UserSettingUtils.openUserSettings("replugged-plugins")}>
        {MapAddonMenuItems(plugins.plugins, plugins)}
      </MenuItem>
      <MenuItem
        id="replugged-themes"
        label={intl.string(t.REPLUGGED_THEMES)}
        action={() => UserSettingUtils.openUserSettings("replugged-themes")}>
        {MapAddonMenuItems(themes.themes, themes)}
      </MenuItem>
      <MenuItem
        id="replugged-updater"
        label={intl.string(t.REPLUGGED_UPDATES_UPDATER)}
        action={() => UserSettingUtils.openUserSettings("replugged-updater")}
      />
    </>,
  );
};
