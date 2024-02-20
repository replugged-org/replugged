import type React from "react";
import { filters, waitForModule } from "../webpack";
import type { Variant } from "./Text";

const Types = {
  WARNING: 0,
  INFO: 1,
  ERROR: 2,
  POSITIVE: 3,
} as const;

interface NoticeProps {
  children: React.ReactNode;
  messageType: (typeof Types)[keyof typeof Types];
  textColor?: string;
  textVariant?: Variant;
  className?: string;
}

export type NoticeType = React.FC<NoticeProps> & {
  Types: typeof Types; // for backwards compat
  HelpMessageTypes: typeof Types;
  default: React.FC<NoticeProps>;
};

const NoticeComp = await waitForModule<NoticeType>(filters.bySource("WARNING=0]"));
const Notice = NoticeComp.default as NoticeType;
Notice.Types = NoticeComp.HelpMessageTypes;
Notice.HelpMessageTypes = NoticeComp.HelpMessageTypes;

export default Notice;
