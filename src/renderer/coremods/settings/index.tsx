import { Messages } from "@common/i18n";
import { Text } from "@components";
import { Injector } from "@replugged";
import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import { ConnectedQuickCSS, General, Plugins, Themes, Updater } from "./pages";

const injector = new Injector();

export { insertSections };

export function VersionInfo(): React.ReactElement {
  return (
    <Text variant="text-xs/normal" color="text-muted" tag="span" style={{ textTransform: "none" }}>
      {Messages.REPLUGGED_VERSION.format({ version: window.RepluggedNative.getVersion() })}
    </Text>
  );
}

export function start(): void {
  settingsTools.addAfter("Billing", [
    Divider(),
    Header("Replugged"),
    Section({
      name: "rp-general",
      label: () => Messages.SETTINGS_GENERAL,
      elem: General,
    }),
    Section({
      name: "rp-quickcss",
      label: () => Messages.REPLUGGED_QUICKCSS,
      elem: ConnectedQuickCSS as unknown as (args: unknown) => React.ReactElement,
    }),
    Section({
      name: "rp-plugins",
      label: () => Messages.REPLUGGED_PLUGINS,
      elem: Plugins,
    }),
    Section({
      name: "rp-themes",
      label: () => Messages.REPLUGGED_THEMES,
      elem: Themes,
    }),
    Section({
      name: "rp-updater",
      label: () => Messages.REPLUGGED_UPDATES_UPDATER,
      elem: Updater,
    }),
  ]);
}

export function stop(): void {
  settingsTools.removeAfter("Billing");
  injector.uninjectAll();
}
