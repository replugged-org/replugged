import type { ReactComponent } from "../../../types";
import { filters, waitForModule } from "../webpack";

export type FormItemType = ReactComponent<{
  children: React.ReactNode;
  title?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "label" | "legend";
  style?: React.CSSProperties;
  className?: string;
  titleClassName?: string;
}>;

const formItemStr =
  '"children","disabled","className","titleClassName","tag","required","style","title","error"';

export const FormItem = (await waitForModule(filters.bySource(formItemStr)).then((mod) =>
  Object.values(mod).find((x) => x?.render?.toString()?.includes(formItemStr)),
)) as FormItemType;
