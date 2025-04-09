import { getFunctionBySource } from "@webpack";
import type React from "react";
import components from "../common/components";
import type { Variant } from "./Text";

enum HelpMessageTypes {
  WARNING = "warn",
  INFO = "info",
  ERROR = "danger",
  POSITIVE = "positive",
  PREVIEW = "preview",
}

interface HelpMessageProps {
  children: React.ReactNode;
  messageType: (typeof HelpMessageTypes)[keyof typeof HelpMessageTypes];
  textColor?: string;
  textVariant?: Variant;
  className?: string;
}

export type NoticeType = React.FC<HelpMessageProps> & {
  Types: typeof HelpMessageTypes; // for backwards compat
  HelpMessageTypes: typeof HelpMessageTypes;
};

const HelpMessage = getFunctionBySource<NoticeType>(components, "messageType:")!;
HelpMessage.HelpMessageTypes = HelpMessageTypes;
HelpMessage.Types = HelpMessage.HelpMessageTypes;

export default HelpMessage;
