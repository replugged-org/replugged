import { t as discordT, intl, runtimeHashMessageKey } from "@common/i18n";
import { Text } from "@components";
import { Injector } from "@replugged";
import { t } from "src/renderer/modules/i18n";
import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import { General, Plugins, QuickCSS, Themes, Updater } from "./pages";

const injector = new Injector();

export { insertSections };

export function VersionInfo(): React.ReactElement {
  return (
    <Text variant="text-xs/normal" color="text-muted" tag="span" style={{ textTransform: "none" }}>
      {intl.format(t.REPLUGGED_VERSION, { version: window.RepluggedNative.getVersion() })}
    </Text>
  );
}

export function start(): void {
  settingsTools.addAfter("Billing", [
    Divider(),
    Header("Replugged"),
    Section({
      name: "rp-general",
      label: () => intl.string(discordT[runtimeHashMessageKey("SETTINGS_GENERAL")]),
      elem: General,
    }),
    Section({
      name: "rp-quickcss",
      label: () => intl.string(t.REPLUGGED_QUICKCSS),
      elem: QuickCSS,
    }),
    Section({
      name: "rp-plugins",
      label: () => intl.string(t.REPLUGGED_PLUGINS),
      elem: Plugins,
    }),
    Section({
      name: "rp-themes",
      label: () => intl.string(t.REPLUGGED_THEMES),
      elem: Themes,
    }),
    Section({
      name: "rp-updater",
      label: () => intl.string(t.REPLUGGED_UPDATES_UPDATER),
      elem: Updater,
    }),
  ]);
}

export function stop(): void {
  settingsTools.removeAfter("Billing");
  injector.uninjectAll();
}
