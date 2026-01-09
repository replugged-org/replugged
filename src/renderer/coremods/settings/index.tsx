import { t as discordT, intl } from "@common/i18n";
import { Text } from "@components";
import { filters, waitForModule } from "@webpack";
import type React from "react";
import { generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import { type UserSettingsFormType } from "src/types";
import {
  MagicWandIcon,
  PaintbrushThinIcon,
  PuzzlePieceIcon,
  RefreshIcon,
  RepluggedIcon,
} from "./icons";
import { addSettingNode, createCustomSettingsPanel, createSection, removeSettingNode } from "./lib";
import {
  AddonType,
  General,
  Plugins,
  QuickCSS,
  Themes,
  Updater,
  useAddonPanelTitle,
} from "./pages";

export function _renderVersionInfo(): React.ReactElement {
  return (
    <Text variant="text-xxs/normal" color="text-muted" tag="span">
      {_getVersionString()}
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
  const section = createSection("replugged_section", {
    useTitle: () => intl.string(t.REPLUGGED_SETTINGS),
    buildLayout: () => [
      createCustomSettingsPanel("general", {
        icon: RepluggedIcon,
        useTitle: () => intl.string(discordT.SETTINGS_GENERAL),
        render: General,
      }),
      createCustomSettingsPanel("quickcss", {
        icon: MagicWandIcon,
        useTitle: () => intl.string(t.REPLUGGED_QUICKCSS),
        render: QuickCSS,
        usePredicate: () => generalSettings.useValue("quickCSS"),
      }),
      createCustomSettingsPanel("plugins", {
        icon: PuzzlePieceIcon,
        useTitle: () => intl.string(t.REPLUGGED_PLUGINS),
        usePanelTitle: () => useAddonPanelTitle(AddonType.Plugin),
        getLegacySearchKey: () => intl.string(t.REPLUGGED_PLUGINS),
        render: Plugins,
      }),
      createCustomSettingsPanel("themes", {
        icon: PaintbrushThinIcon,
        useTitle: () => intl.string(t.REPLUGGED_THEMES),
        usePanelTitle: () => useAddonPanelTitle(AddonType.Theme),
        getLegacySearchKey: () => intl.string(t.REPLUGGED_THEMES),
        render: Themes,
      }),
      createCustomSettingsPanel("updater", {
        icon: RefreshIcon,
        useTitle: () => intl.string(t.REPLUGGED_UPDATES_UPDATER),
        render: Updater,
      }),
    ],
  });

  addSettingNode(section, { after: "billing_section" });
}
export function stop(): void {
  removeSettingNode("replugged_section");
}

export { _insertNodes } from "./lib";
