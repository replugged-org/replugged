import components from "./components";

export const { ToastType, ToastPosition, createToast, showToast, popToast } = components;

export const toast = (content: string, type = ToastType.SUCCESS, opts = undefined): void => {
  const props = createToast(content, type, opts);
  showToast(props);
};
