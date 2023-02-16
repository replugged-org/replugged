import type { ObjectExports } from "../../../types";
import { filters, getFunctionBySource, waitForModule } from "../webpack";

enum NoticeTypes {
  WARNING = 0,
  INFO = 1,
  ERROR = 2,
  POSITIVE = 3,
}

export type NoticeType = React.ComponentType<{
  children: React.ReactNode;
  messageType?: NoticeTypes;
  textColor?: string;
  textVariant?: string;
  className?: string;
}>;

const noticeRgx = /.\.messageType/;

export default (await waitForModule(filters.bySource(noticeRgx)).then((mod) =>
  getFunctionBySource(mod as ObjectExports, noticeRgx),
)) as NoticeType;
