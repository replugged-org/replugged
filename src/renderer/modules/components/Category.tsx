import React from "@common/react";
import { Divider, FormText } from ".";
import { waitForProps } from "../webpack";

const classes = await waitForProps<
  Record<"labelRow" | "title" | "note" | "dividerDefault", string>
>("dividerDefault");

interface CategoryProps {
  title: string;
  open?: boolean;
  note?: string;
  disabled?: boolean;
  onChange?: () => void;
}

export type CategoryType = React.FC<React.PropsWithChildren<CategoryProps>>;

/**
 * A category. It's opened state, by default, is automatically handled by the component. `open` and `onChange` both must be specified to override.
 */
export default ((props: React.PropsWithChildren<CategoryProps>) => {
  const [open, setOpen] = React.useState(props.open || false);

  const handleClick = (): void => {
    if (props.disabled) return;

    if (typeof props.onChange === "function" && typeof props.open === "boolean") props.onChange();
    else setOpen(!open);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          cursor: props.disabled ? "not-allowed" : "pointer",
          alignItems: "center",
          display: "flex",
          opacity: props.disabled ? 0.3 : undefined,
        }}
        onClick={() => {
          handleClick();
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{
            width: 28,
            height: 28,
            marginRight: 15,
            transition: "transform 0.3s",
            transform: open ? "rotate(90deg)" : undefined,
          }}>
          <path
            fill="var(--header-primary)"
            d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"
          />
        </svg>
        <div style={{ flex: 1 }}>
          <div className={classes.labelRow}>
            <label
              className={classes.title}
              style={{ cursor: props.disabled ? "not-allowed" : "pointer" }}>
              {props.title}
            </label>
          </div>
          {props.note && (
            <FormText.DESCRIPTION className={classes.note}>{props.note}</FormText.DESCRIPTION>
          )}
        </div>
      </div>
      {open ? (
        <div
          style={{
            marginTop: 20,
            marginLeft: 12,
            borderLeft: "1px var(--background-modifier-accent) solid",
            paddingLeft: 33,
            cursor: props.disabled ? "not-allowed" : undefined,
            opacity: props.disabled ? 0.3 : undefined,
          }}>
          {props.children}
        </div>
      ) : (
        <Divider className={classes.dividerDefault} />
      )}
    </div>
  );
}) as CategoryType;
