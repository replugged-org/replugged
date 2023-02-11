import type { ObjectExports } from "../../../../types";
import { filters, getFunctionBySource, waitForModule } from "..";

const Kind = {
  MESSAGE: 0,
  SUCCESS: 1,
  FAILURE: 2,
  CUSTOM: 3,
} as const;

interface ToastOpts {
  position?: number;
  duration?: number;
  component?: React.ReactElement;
}

type ToastFn = (
  content: string | React.ReactElement | null,
  kind?: number,
  opts?: ToastOpts,
) => void;

export interface Toast {
  toast: ToastFn;
  Kind: typeof Kind;
}

const mod = await waitForModule(filters.bySource("queuedToasts"));
const fn = getFunctionBySource(mod as ObjectExports, "queuedToasts).concat")!;

const propGenMod = await waitForModule(filters.bySource(/case \w+\.\w+\.FAILURE/));
const propGenFn = getFunctionBySource(propGenMod as ObjectExports, "position")!;

const toast: ToastFn = (content, kind = Kind.SUCCESS, opts = undefined) => {
  const props = propGenFn(content, kind, opts);
  fn(props);
};

export default {
  toast,
  Kind,
} as Toast;
