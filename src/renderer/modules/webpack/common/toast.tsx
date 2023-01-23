import type { ObjectExports } from "../../../../types";
import { filters, getFunctionBySource, waitForModule } from "..";
import { Text } from "@components";

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

interface ToastWithIconProps {
  icon: React.ReactElement;
  iconProps?: React.HTMLAttributes<HTMLDivElement>;
  text: string;
}

type ToastFn = (
  content: string | React.ReactElement | null,
  kind?: number,
  opts?: ToastOpts,
) => void;

export interface Toast {
  toast: ToastFn;
  Kind: typeof Kind;
  ToastWithIcon: (props: ToastWithIconProps) => React.ReactElement;
}

const classMod = await waitForModule<Record<"toast" | "icon", string>>(
  filters.byProps("toast", "icon"),
);

const mod = await waitForModule(filters.bySource("queuedToasts"));
const fn = getFunctionBySource("queuedToasts).concat", mod as ObjectExports)!;

const propGenMod = await waitForModule(filters.bySource(/case \w+\.\w+\.FAILURE/));
const propGenFn = getFunctionBySource("position", propGenMod as ObjectExports)!;

const toast: ToastFn = (content, kind = Kind.SUCCESS, opts = undefined) => {
  const props = propGenFn(content, kind, opts);
  fn(props);
};

function ToastWithIcon({ icon, iconProps, text }: ToastWithIconProps) {
  return (
    <div className={classMod.toast}>
      <div
        className={classMod.icon}
        style={{ width: "24px", height: "24px" }}
        {...(iconProps || {})}>
        {icon}
      </div>
      <Text variant="text-md/normal" color="header-primary">
        {text}
      </Text>
    </div>
  );
}

export default {
  toast,
  Kind,
  ToastWithIcon,
} as Toast;
