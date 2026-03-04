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
  filters.bySource(/PREMIUM_TIER_1:\i\.\i,/),
);

const remappedNoticeMod: NoticeMod = {
  NoticeColors: Object.values(actualNoticeMod).find((v) => typeof v === "object")!,
  NoticeButton: getFunctionBySource(actualNoticeMod, /minor:\i=!1/)!,
  PrimaryCTANoticeButton: getFunctionBySource(actualNoticeMod, /\.onClick&&\i\.onClick/)!,
  NoticeButtonAnchor: getFunctionBySource(actualNoticeMod, /href:\i,onClick/)!,
  NoticeCloseButton: getFunctionBySource(actualNoticeMod, "focusProps:{offset:")!,
  Notice: getFunctionBySource(actualNoticeMod, /color:\i=\i\.DEFAULT/)!,
};

export default remappedNoticeMod;
