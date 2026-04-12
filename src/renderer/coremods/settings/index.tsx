import { intl } from "@common/i18n";
import { Text } from "@components";
import type React from "react";
import { t } from "src/renderer/modules/i18n";
import { addSettingNode, createSection, removeSettingNode } from "./lib";
import {
  GeneralSidebarItem,
  PluginsSidebarItem,
  QuickCSSSidebarItem,
  ThemesSidebarItem,
  UpdaterSidebarItem,
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

export function start(): void {
  const RepluggedSection = createSection("replugged_section", {
    useTitle: () => intl.string(t.REPLUGGED_SETTINGS),
    buildLayout: () => [
      GeneralSidebarItem,
      QuickCSSSidebarItem,
      PluginsSidebarItem,
      ThemesSidebarItem,
      UpdaterSidebarItem,
    ],
  });

  addSettingNode(RepluggedSection, { after: "billing_section" });
}
export function stop(): void {
  removeSettingNode("replugged_section");
}

export { _insertNodes } from "./lib";
