import { t as discordT, intl } from "@common/i18n";
import { Text } from "@components";
import { filters, waitForModule } from "@webpack";
import type React from "react";
import { generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import { type UserSettingsFormType } from "src/types";
import {
  DownloadIcon,
  MagicWandIcon,
  PaintPaletteIcon,
  PuzzlePieceIcon,
  RepluggedIcon,
} from "./icons";
import { addSettingNode, createCustomSettingsPane, createSection, removeSettingNode } from "./lib";
import { General, Plugins, QuickCSS, Themes, Updater } from "./pages";

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
    useLabel: () => intl.string(t.REPLUGGED_SETTINGS),
    buildLayout: () => [
      createCustomSettingsPane("general", {
        icon: RepluggedIcon,
        useTitle: () => intl.string(discordT.SETTINGS_GENERAL),
        render: General,
      }),
      createCustomSettingsPane("quickcss", {
        icon: MagicWandIcon,
        useTitle: () => intl.string(t.REPLUGGED_QUICKCSS),
        render: QuickCSS,
        usePredicate: () => generalSettings.useValue("quickCSS"),
      }),
      createCustomSettingsPane("plugins", {
        icon: PuzzlePieceIcon,
        useTitle: () => intl.string(t.REPLUGGED_PLUGINS),
        render: Plugins,
      }),
      createCustomSettingsPane("themes", {
        icon: PaintPaletteIcon,
        useTitle: () => intl.string(t.REPLUGGED_THEMES),
        render: Themes,
      }),
      createCustomSettingsPane("updater", {
        icon: DownloadIcon,
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
