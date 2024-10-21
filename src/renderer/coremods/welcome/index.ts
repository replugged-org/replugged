import { generalSettings } from "../settings/pages/General";
import { notices, util } from "@replugged";
import { Messages } from "@common/i18n";
import { DISCORD_INVITE } from "src/constants";

export function start(): void {
  if (!generalSettings.get("showWelcomeNoticeOnOpen")) return;
  notices.sendAnnouncement({
    message: Messages.REPLUGGED_NOTICES_WELCOME_NEW_USER,
    button: {
      text: Messages.REPLUGGED_NOTICES_JOIN_SERVER_BUTTON,
      onClick: () => {
        void util.goToOrJoinServer(DISCORD_INVITE);
        generalSettings.set("showWelcomeNoticeOnOpen", false);
      },
    },
    onClose: () => {
      generalSettings.set("showWelcomeNoticeOnOpen", false);
    },
  });
}
