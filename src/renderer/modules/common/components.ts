import { waitForProps } from "../webpack";

export default await waitForProps<Record<string, unknown>>([
  "ConfirmModal",
  "ToastPosition",
  "Text",
]);
