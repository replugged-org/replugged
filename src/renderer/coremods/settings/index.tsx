import { Divider, Header, Section, insertSections, settingsTools } from "./lib";
import { General } from "./pages";

export { insertSections };

export function start(): void {
  settingsTools.addAfter("Billing", [
    /* eslint-disable */
    Divider(),
    Header("Replugged"),
    Section({
      name: "rp-general",
      label: "General",
      elem: General,
    }),
    /* eslint-enable */
  ]);
}
