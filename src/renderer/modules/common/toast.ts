import components from "./components";

import type { ToastOptions } from "discord-client-types/discord_app/design/web";

export const { ToastType, ToastPosition, createToast, showToast, popToast } = components;

export const toast = (content: string, type = ToastType.SUCCESS, opts?: ToastOptions): void => {
  const props = createToast(content, type, opts);
  showToast(props);
};
