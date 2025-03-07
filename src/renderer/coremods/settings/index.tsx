import { i18n } from "@common";
import { Text } from "@components";
import { Injector } from "@recelled";
import { t } from "src/renderer/modules/i18n";
import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import { General, Plugins, QuickCSS, Themes, Updater } from "./pages";

const { t: discordT, intl } = i18n;

const injector = new Injector();

export { insertSections };

export function VersionInfo(): React.ReactElement {
  return (
    <Text variant="text-xs/normal" color="text-muted" tag="span" style={{ textTransform: "none" }}>
      {intl.format(t.RECELLED_VERSION, { version: window.ReCelledNative.getVersion() })}
    </Text>
  );
}

export function start(): void {
  settingsTools.addAfter("Billing", [
    Divider(),
    Header("ReCelled"),
    Section({
      name: "rc-general",
      label: () => intl.string(discordT.SETTINGS_GENERAL),
      elem: General,
    }),
    Section({
      name: "rc-quickcss",
      label: () => intl.string(t.RECELLED_QUICKCSS),
      elem: QuickCSS,
    }),
    Section({
      name: "rc-plugins",
      label: () => intl.string(t.RECELLED_PLUGINS),
      elem: Plugins,
    }),
    Section({
      name: "rc-themes",
      label: () => intl.string(t.RECELLED_THEMES),
      elem: Themes,
    }),
    Section({
      name: "rc-updater",
      label: () => intl.string(t.RECELLED_UPDATES_UPDATER),
      elem: Updater,
    }),
  ]);
}

export function stop(): void {
  settingsTools.removeAfter("Billing");
  injector.uninjectAll();
}
