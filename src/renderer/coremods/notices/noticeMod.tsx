import type React from "react";
import { filters, getFunctionBySource, waitForModule } from "src/renderer/modules/webpack";

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

const mod = await waitForModule(filters.bySource("().colorPremiumTier1"));

export default {
  NoticeColors: getFunctionBySource(mod, "().colorDefault"),
  NoticeButton: getFunctionBySource(mod, "().buttonMinor"),
  PrimaryCTANoticeButton: getFunctionBySource(mod, "CTA"),
  NoticeButtonAnchor: getFunctionBySource(mod, "href"),
  NoticeCloseButton: getFunctionBySource(mod, "().closeButton"),
  Notice: getFunctionBySource(mod, "().notice"),
} as NoticeMod;
