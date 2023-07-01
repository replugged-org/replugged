import { generalSettings } from "../settings/pages/General";
import { notices } from "@replugged";
import { Messages } from "@common/i18n";

export function start(): void {
  if (!generalSettings.get("showWelcomeNoticeOnOpen")) return;
  notices.sendAnnouncement({ message: Messages.REPLUGGED_WELCOME_NOTICE });
  generalSettings.set("showWelcomeNoticeOnOpen", false);
}
