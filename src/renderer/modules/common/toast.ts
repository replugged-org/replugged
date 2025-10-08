import { components } from ".";

enum ToastType {
  MESSAGE = "message",
  SUCCESS = "success",
  FAILURE = "failure",
  CUSTOM = "custom",
  CLIP = "clip",
  LINK = "link",
  FORWARD = "forward",
  INVITE = "invite",
  BOOKMARK = "bookmark",
  CLOCK = "clock",
  AI = "ai",
}

enum ToastPosition {
  TOP = 0,
  BOTTOM = 1,
}

export interface Toast {
  toast: typeof toast;
  Kind: typeof ToastType;
  Position: typeof ToastPosition;
}

const toast = (content: string, kind = ToastType.SUCCESS, opts = undefined): void => {
  const props = components.createToast(content, kind, opts);
  components.showToast(props);
};

export default {
  toast,
  Kind: ToastType,
  Position: ToastPosition,
} as Toast;
