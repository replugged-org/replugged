import type React from "react";
import { components } from ".";

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

interface ToastProps {
  message: string | React.ReactElement | null;
  id: string;
  type: (typeof Kind)[keyof typeof Kind];
  options: ToastOptions;
}

export type CreateToast = (
  content: string | React.ReactElement | null,
  kind?: (typeof Kind)[keyof typeof Kind],
  opts?: ToastOptions,
) => ToastProps;

export type ShowToast = (props: ToastProps) => void;

type ToastFn = (
  content: string | React.ReactElement | null,
  kind?: (typeof Kind)[keyof typeof Kind],
  opts?: ToastOptions,
) => void;

export interface Toast {
  toast: ToastFn;
  Kind: typeof Kind;
  Position: typeof Position;
}

const toast: ToastFn = (content, kind = Kind.SUCCESS, opts = undefined) => {
  const props = components.createToast(content, kind, opts);
  components.showToast(props);
};

export default {
  toast,
  Kind,
  Position,
} as Toast;
