import type React from "react";
import { filters, waitForModule } from "../webpack";

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
  textVariant?: string;
  className?: string;
}

export type NoticeType = React.ComponentType<NoticeProps> & {
  Types: typeof Types;
};

const Notice = (await waitForModule(filters.bySource(/.\.messageType/)).then((mod) =>
  Object.values(mod).find((x) => typeof x === "function"),
)) as NoticeType;
Notice.Types = Types;

export default Notice;
