import { filters, getExportsForProps, getFunctionBySource, waitForModule } from "@webpack";

import type * as Design from "discord-client-types/discord_app/design/web";

const toastMod = await waitForModule(filters.bySource(/case \i\.\i\.AI:/));
export const createToast = getFunctionBySource<Design.CreateToast>(toastMod, "id:(0,")!;

const toastAPIMod = await waitForModule(filters.bySource(/new Map\(\i\.currentToastMap\),/));
export const showToast = getFunctionBySource<Design.ShowToast>(
  toastAPIMod,
  ".options?.appContext",
)!;
export const popToast = getFunctionBySource<Design.PopToast>(toastAPIMod, ".queuedToastsMap.get(")!;

const toastConstantsMod = await waitForModule(filters.bySource(/{position:0,component:null/));
export const ToastType = getExportsForProps<typeof Design.ToastType>(toastConstantsMod, [
  "MESSAGE",
  "AI",
])!;
export const ToastPosition = getExportsForProps<typeof Design.ToastPosition>(toastConstantsMod, [
  "TOP",
])!;

export const toast = (
  content: string,
  type = ToastType.SUCCESS,
  opts?: Design.ToastOptions,
): void => {
  const props = createToast(content, type, opts);
  showToast(props);
};
