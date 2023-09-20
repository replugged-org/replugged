import { Messages } from "@common/i18n";
import { Text } from "@components";
import { Injector } from "@replugged";
import { filters, waitForModule } from "src/renderer/modules/webpack";
import type { Section as SectionType } from "src/types/coremods/settings";
import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import { General, Plugins, ConnectedQuickCSS, Themes, Updater } from "./pages";

const injector = new Injector();

export { insertSections };

interface VersionMod {
  Z: () => SectionType[];
}
async function injectVersionInfo(): Promise<void> {
  const mod = await waitForModule<VersionMod>(filters.bySource("().versionHash"), { raw: true });

  injector.after(mod.exports, "Z", (_, sections: SectionType[]) => {
    const lastSection = sections.at(-1)!;
    const element = lastSection.element?.({});
    if (!element) return;
    element.props.children.push(
      <Text
        variant="text-xs/normal"
        color="text-muted"
        tag="span"
        style={{ textTransform: "none" }}>
        {Messages.REPLUGGED_VERSION.format({ version: window.RepluggedNative.getVersion() })}
      </Text>,
    );
    lastSection.element = () => element;
  });
}

export function start(): void {
  void injectVersionInfo();

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
