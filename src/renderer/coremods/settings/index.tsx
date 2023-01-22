import { Messages } from "@common/i18n";
import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import { General } from "./pages";
import { Plugins, Themes } from "./pages/Addons";

export { insertSections };

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
      name: "rp-plugins",
      label: () => Messages.REPLUGGED_PLUGINS,
      elem: Plugins,
    }),
    Section({
      name: "rp-themes",
      label: () => Messages.REPLUGGED_THEMES,
      elem: Themes,
    }),
  ]);
}

export function stop(): void {
  settingsTools.removeAfter("Billing");
}
