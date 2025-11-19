import { t as discordT, intl } from "@common/i18n";
import { Text } from "@components";
import { filters, waitForModule } from "@webpack";
import { generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import type { UserSettingsFormType } from "src/types";
import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import {
  General,
  GeneralIcon,
  GeneralStrings,
  Plugins,
  PluginsHeader,
  PluginsIcon,
  PluginsStrings,
  QuickCSS,
  QuickCSSIcon,
  QuickCSSStrings,
  Themes,
  ThemesHeader,
  ThemesIcon,
  ThemesStrings,
  Updater,
  UpdaterIcon,
  UpdaterStrings,
} from "./pages";
import SettingsLibs from "./SettingsLibs";


export { SettingsLibs, insertSections };

export function VersionInfo(): React.ReactElement {
  return (
    <Text variant="text-xs/normal" color="text-muted" tag="span" style={{ textTransform: "none" }}>
      {intl.format(t.REPLUGGED_VERSION, { version: window.RepluggedNative.getVersion() })}
    </Text>
  );
}

export function _getCompactVersionInfo(): React.ReactElement {
  return (
    <Text variant="text-xxs/normal" color="text-muted" tag="span" style={{ textTransform: "none" }}>
      {`[${window.RepluggedNative.getVersion()}]`}
    </Text>
  );
}

export function _getVersionString(): string {
  return intl.formatToPlainString(t.REPLUGGED_VERSION, {
    version: window.RepluggedNative.getVersion(),
  });
}

export const UserSettingsForm = await waitForModule<UserSettingsFormType>(
  filters.bySource(/title:\i,className:\i,children:\i}=\i,\i=\(0/),
);

export function start(): void {
  settingsTools.addAfter("Billing", [
    Divider(),
    Header(intl.string(t.REPLUGGED)),
    Section({
      name: "replugged-general",
      label: () => intl.string(discordT.SETTINGS_GENERAL),
      elem: General,
    }),
    Section({
      name: "replugged-quickcss",
      label: () => intl.string(t.REPLUGGED_QUICKCSS),
      tabPredicate: () => generalSettings.useValue("quickCSS"),
      elem: QuickCSS,
    }),
    Section({
      name: "replugged-plugins",
      label: () => intl.string(t.REPLUGGED_PLUGINS),
      elem: Plugins,
    }),
    Section({
      name: "replugged-themes",
      label: () => intl.string(t.REPLUGGED_THEMES),
      elem: Themes,
    }),
    Section({
      name: "replugged-updater",
      label: () => intl.string(t.REPLUGGED_UPDATES_UPDATER),
      elem: Updater,
    }),
  ]);

  SettingsLibs.add({
    key: "replugged-coremod-settings",
    parent: "$Root",
    after: "billing_section",
    settings: {
      header: () => intl.string(t.REPLUGGED),
      layout: [
        {
          key: "replugged-general",
          title: () => intl.string(discordT.SETTINGS_GENERAL),
          render: General,
          icon: GeneralIcon,
          strings: GeneralStrings
        },
        {
          key: "replugged-quickcss",
          title: () => intl.string(t.REPLUGGED_QUICKCSS),
          predicate: () => generalSettings.useValue("quickCSS"),
          render: QuickCSS,
          icon: QuickCSSIcon,
          strings: QuickCSSStrings
        },
        {
          key: "replugged-plugins",
          title: () => intl.string(t.REPLUGGED_PLUGINS),
          render: Plugins,
          icon: PluginsIcon,
          header: PluginsHeader,
          strings: PluginsStrings
        },
        {
          key: "replugged-themes",
          title: () => intl.string(t.REPLUGGED_THEMES),
          render: Themes,
          icon: ThemesIcon,
          header: ThemesHeader,
          strings: ThemesStrings
        },
        {
          key: "replugged-updater",
          title: () => intl.string(t.REPLUGGED_UPDATES_UPDATER),
          render: Updater,
          icon: UpdaterIcon,
          strings: UpdaterStrings
        },
      ],
    },
  });
}

export function stop(): void {
  settingsTools.removeAfter("Billing");
  SettingsLibs.remove("replugged-coremod-settings");
}
