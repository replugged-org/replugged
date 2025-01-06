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

const remappedNoticeMod: NoticeMod = {
  NoticeColors: {} as NoticeMod["NoticeColors"],
  NoticeButton: () => null,
  PrimaryCTANoticeButton: () => null,
  NoticeButtonAnchor: () => null,
  NoticeCloseButton: () => null,
  Notice: () => null,
};

const mapNoticeMod = async (): Promise<void> => {
  const actualNoticeMod = await waitForModule<Record<string, ValueOf<NoticeMod>>>(
    filters.bySource(".colorPremiumTier1,"),
  );

  remappedNoticeMod.NoticeColors = Object.values(actualNoticeMod).find(
    (v) => typeof v === "object",
  ) as NoticeMod["NoticeColors"];
  remappedNoticeMod.NoticeButton = getFunctionBySource(actualNoticeMod, "buttonMinor")!;
  remappedNoticeMod.PrimaryCTANoticeButton = getFunctionBySource(actualNoticeMod, "CTA")!;
  remappedNoticeMod.NoticeButtonAnchor = getFunctionBySource(actualNoticeMod, ".Anchor")!;
  remappedNoticeMod.NoticeCloseButton = getFunctionBySource(actualNoticeMod, "closeIcon")!;
  remappedNoticeMod.Notice = getFunctionBySource(actualNoticeMod, "isMobile")!;
};

void mapNoticeMod();

export default remappedNoticeMod;
