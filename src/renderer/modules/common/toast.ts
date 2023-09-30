import { filters, getFunctionBySource, waitForModule } from "../webpack";

const Kind = {
  MESSAGE: 0,
  SUCCESS: 1,
  FAILURE: 2,
  CUSTOM: 3,
  CLIP: 4,
} as const;

const Position = {
  TOP: 0,
  BOTTOM: 1,
} as const;

interface ToastOptions {
  position?: (typeof Position)[keyof typeof Position];
  duration?: number;
  component?: React.ReactElement;
}

type ToastFn = (
  content: string | React.ReactElement | null,
  kind?: (typeof Kind)[keyof typeof Kind],
  opts?: ToastOptions,
) => unknown;

export interface Toast {
  toast: ToastFn;
  Kind: typeof Kind;
  Position: typeof Position;
}

const mod = await waitForModule(filters.bySource("queuedToasts"));
const fn = getFunctionBySource<(props: ReturnType<ToastFn>) => void>(mod, "queuedToasts).concat")!;

const propGenMod = await waitForModule(filters.bySource(/case (\w+\.){1,2}FAILURE/));
const propGenFn = getFunctionBySource<ToastFn>(
  propGenMod,
  /options:{position:\w+,component:\w+,duration:\w+}/,
)!;

const toast: ToastFn = (content, kind = Kind.SUCCESS, opts = undefined) => {
  const props = propGenFn(content, kind, opts);
  fn(props);
};

export default {
  toast,
  Kind,
  Position,
} as Toast;
