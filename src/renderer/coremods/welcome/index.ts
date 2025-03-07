import { i18n } from "@common";
import { notices, util } from "@recelled";
import { DISCORD_INVITE } from "src/constants";
import { t } from "src/renderer/modules/i18n";
import { generalSettings } from "../settings/pages/General";

export function start(): void {
  if (!generalSettings.get("showWelcomeNoticeOnOpen")) return;
  notices.sendAnnouncement({
    message: i18n.intl.string(t.RECELLED_NOTICES_WELCOME_NEW_USER),
    button: {
      text: i18n.intl.string(t.RECELLED_NOTICES_JOIN_SERVER_BUTTON),
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
