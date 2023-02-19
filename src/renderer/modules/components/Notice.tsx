import { filters, waitForModule } from "../webpack";

const NoticeTypes = {
  WARNING: 0,
  INFO: 1,
  ERROR: 2,
  POSITIVE: 3,
} as const;

interface NoticeProps {
  children: React.ReactNode;
  messageType: (typeof NoticeTypes)[keyof typeof NoticeTypes];
  textColor?: string;
  textVariant?: string;
  className?: string;
}

export type NoticeType = React.ComponentType<NoticeProps> & {
  NoticeTypes: typeof NoticeTypes;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const Notice = (await waitForModule(filters.bySource(/.\.messageType/)).then((mod) =>
  Object.values(mod).find((x) => typeof x === "function"),
)) as NoticeType;
Notice.NoticeTypes = NoticeTypes;

export default Notice;
