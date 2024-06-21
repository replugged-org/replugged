import type React from "react";
import { filters, getFunctionBySource, waitForModule } from "src/renderer/modules/webpack";
import { ValueOf } from "type-fest";

interface AnchorProps extends React.ComponentPropsWithoutRef<"a"> {
  useDefaultUnderlineStyles?: boolean;
  focusProps?: Record<string, unknown>;
}

interface NoticeButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  className?: string;
  minor?: boolean;
}

interface PrimaryCTANoticeButtonProps extends NoticeButtonProps {
  noticeType?: string;
  additionalTrackingProps?: Record<string, unknown>;
}

interface NoticeButtonAnchorProps extends AnchorProps {}

interface NoticeCloseButtonProps {
  onClick: () => void;
  noticeType?: string;
}

interface NoticeProps {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface NoticeMod {
  NoticeColors: Record<
    | "DEFAULT"
    | "NEUTRAL"
    | "BRAND"
    | "WARNING"
    | "DANGER"
    | "INFO"
    | "STREAMER_MODE"
    | "CUSTOM"
    | "SPOTIFY"
    | "PLAYSTATION"
    | "PREMIUM_TIER_0"
    | "PREMIUM_TIER_1"
    | "PREMIUM_TIER_2",
    string
  >;
  NoticeButton: React.FC<React.PropsWithChildren<NoticeButtonProps>>;
  PrimaryCTANoticeButton: React.FC<React.PropsWithChildren<PrimaryCTANoticeButtonProps>>;
  NoticeButtonAnchor: React.FC<React.PropsWithChildren<NoticeButtonAnchorProps>>;
  NoticeCloseButton: React.FC<NoticeCloseButtonProps>;
  Notice: React.FC<React.PropsWithChildren<NoticeProps>>;
}

const actualNoticeMod = await waitForModule<Record<string, ValueOf<NoticeMod>>>(
  filters.bySource(".colorPremiumTier1,"),
);

const remappedNoticeMod: NoticeMod = {
  NoticeColors: Object.values(actualNoticeMod).find(
    (v) => typeof v === "object",
  ) as NoticeMod["NoticeColors"],
  NoticeButton: getFunctionBySource(actualNoticeMod, "buttonMinor")!,
  PrimaryCTANoticeButton: getFunctionBySource(actualNoticeMod, "CTA")!,
  NoticeButtonAnchor: getFunctionBySource(actualNoticeMod, ".Anchor")!,
  NoticeCloseButton: getFunctionBySource(actualNoticeMod, "DISMISS")!,
  Notice: getFunctionBySource(actualNoticeMod, "isMobile")!,
};

export default remappedNoticeMod;
