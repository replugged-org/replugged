import components from "@common/components";
import type React from "react";
import type { Variant } from "./Text";

const HelpMessageTypes = {
  WARNING: 0,
  INFO: 1,
  ERROR: 2,
  POSITIVE: 3,
} as const;

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

const { HelpMessage } = components;
HelpMessage.HelpMessageTypes = components.HelpMessageTypes;
HelpMessage.Types = HelpMessage.HelpMessageTypes;

export default HelpMessage;
