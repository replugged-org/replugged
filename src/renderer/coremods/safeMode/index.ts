import { t as discordT, intl } from "@common/i18n";
import { notices } from "@replugged";
import { safeMode } from "src/renderer/managers/ignition";
import { t } from "src/renderer/modules/i18n";

export function start(): void {
  if (!safeMode) return;
  notices.sendAnnouncement({
    message: intl.string(t.REPLUGGED_SAFE_MODE_ACTIVE),
    button: {
      text: intl.string(discordT.ERRORS_RELOAD),
      onClick: () => setTimeout(() => window.location.reload(), 250),
    },
  });
}
