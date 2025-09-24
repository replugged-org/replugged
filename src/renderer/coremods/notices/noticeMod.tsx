import { filters, getFunctionBySource, waitForModule } from "src/renderer/modules/webpack";
import type { ValueOf } from "type-fest";

import type * as Design from "discord-client-types/discord_app/design/web";

interface NoticeMod {
  NoticeColors: Design.NoticeColors;
  NoticeButton: Design.NoticeButton;
  PrimaryCTANoticeButton: Design.PrimaryCTANoticeButton;
  NoticeButtonAnchor: Design.NoticeButtonAnchor;
  NoticeCloseButton: Design.NoticeCloseButton;
  Notice: Design.Notice;
}

const actualNoticeMod = await waitForModule<Record<string, ValueOf<NoticeMod>>>(
  filters.bySource(".colorPremiumTier1,"),
);

const remappedNoticeMod: NoticeMod = {
  NoticeColors: Object.values(actualNoticeMod).find((v) => typeof v === "object")!,
  NoticeButton: getFunctionBySource(actualNoticeMod, "buttonMinor")!,
  PrimaryCTANoticeButton: getFunctionBySource(actualNoticeMod, "additionalTrackingProps")!,
  NoticeButtonAnchor: getFunctionBySource(actualNoticeMod, ".button,href:")!,
  NoticeCloseButton: getFunctionBySource(actualNoticeMod, "closeIcon")!,
  Notice: getFunctionBySource(actualNoticeMod, "isMobile")!,
};

export default remappedNoticeMod;
