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

export type NoticeType = React.ComponentType<NoticeProps> & {
  Types: typeof Types;
};

const Notice = await waitForModule<Record<string, NoticeType>>(
  filters.bySource(/.\.messageType/),
).then((mod) => Object.values(mod).find((x) => typeof x === "function")!);
Notice.Types = Types;

export default Notice;
