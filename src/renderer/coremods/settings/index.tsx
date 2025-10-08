import { t as discordT, intl } from "@common/i18n";
import { Text } from "@components";
import { generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import { Section, getSectionKeys, insertRecords, insertSections, settingsTools } from "./lib";
import { General, Plugins, QuickCSS, Themes, Updater } from "./pages";
import searchableTitles from "./searchableTitles";

export { getSectionKeys, insertRecords, insertSections };

export function VersionInfo(): React.ReactElement {
  return (
    <Text variant="text-xs/normal" color="text-muted" tag="span" style={{ textTransform: "none" }}>
      {intl.format(t.REPLUGGED_VERSION, { version: window.RepluggedNative.getVersion() })}
    </Text>
  );
}

export function _getVersionString(): string {
  return intl.formatToPlainString(t.REPLUGGED_VERSION, {
    version: window.RepluggedNative.getVersion(),
  });
}

export function start(): void {
  settingsTools.addAfter("BILLING", {
    divider: true,
    header: "Replugged",
    settings: [
      Section({
        name: "rp-general",
        label: () => intl.string(discordT.SETTINGS_GENERAL),
        elem: General,
        searchableTitles: searchableTitles.general,
      }),
      Section({
        name: "rp-quickcss",
        label: () => intl.string(t.REPLUGGED_QUICKCSS),
        tabPredicate: () => generalSettings.useValue("quickCSS"),
        elem: QuickCSS,
        searchableTitles: searchableTitles.quickCSS,
      }),
      Section({
        name: "rp-plugins",
        label: () => intl.string(t.REPLUGGED_PLUGINS),
        elem: Plugins,
        searchableTitles: searchableTitles.plugins,
      }),
      Section({
        name: "rp-themes",
        label: () => intl.string(t.REPLUGGED_THEMES),
        elem: Themes,
        searchableTitles: searchableTitles.themes,
      }),
      Section({
        name: "rp-updater",
        label: () => intl.string(t.REPLUGGED_UPDATES_UPDATER),
        elem: Updater,
        searchableTitles: searchableTitles.updater,
      }),
    ],
  });
}

export function stop(): void {
  settingsTools.removeAfter("BILLING");
}
