import components from "@common/components";
import type React from "react";
import type { Variant } from "./Text";
import { getFunctionBySource } from "@webpack";

enum HelpMessageTypes {
  WARNING = 0,
  INFO,
  ERROR,
  POSITIVE,
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
