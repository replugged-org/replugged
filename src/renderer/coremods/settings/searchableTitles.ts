import { t as discordT, intl } from "@common/i18n";
import { t } from "src/renderer/modules/i18n";
import { plugins } from "src/renderer/managers/plugins";
import { themes } from "src/renderer/managers/themes";

export default {
  general: () => [
    intl.string(discordT.SETTINGS_GENERAL),
    intl.string(t.REPLUGGED_SETTINGS_DEV_COMPANION),
    intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS),
    intl.string(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS),
    intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS),
    intl.string(t.REPLUGGED_SETTINGS_BADGES),
    intl.string(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS),
    intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY),
    intl.string(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR),
    intl.string(t.REPLUGGED_SETTINGS_BACKEND),
    intl.string(t.REPLUGGED_SETTINGS_DEV_COMPANION),
  ],
  quickCSS: [intl.string(t.REPLUGGED_QUICKCSS), intl.string(t.REPLUGGED_QUICKCSS_FOLDER_OPEN)],
  plugins: () =>
    [...plugins.values()]
      .map((x) => [
        x.manifest.name,
        x.manifest.id,
        x.manifest.description,
        ...[x.manifest.author].flat().map(Object.values).flat(),
      ])
      .flat(10),

  themes: () =>
    [...themes.values()]
      .map((x) => [
        x.manifest.name,
        x.manifest.id,
        x.manifest.description,
        ...[x.manifest.author].flat().map(Object.values).flat(),
      ])
      .flat(10),

  updater: [
    intl.string(t.REPLUGGED_UPDATES_UPDATE_ALL),
    intl.string(t.REPLUGGED_UPDATES_CHECK),
    intl.string(discordT.UPDATE),
    intl.string(t.REPLUGGED_UPDATES_UPDATER),
    intl.formatToPlainString(t.REPLUGGED_DEVELOPER_MODE_WARNING, {
      url: "https://replugged.dev/download",
    }),
    intl.string(t.REPLUGGED_UPDATES_OPTS_INTERVAL),
    intl.string(t.REPLUGGED_UPDATES_OPTS_AUTO),
    intl.string(t.REPLUGGED_UPDATES_UPDATER),
  ],
};
