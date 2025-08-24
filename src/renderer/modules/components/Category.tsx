import React from "@common/react";
import { waitForProps } from "@webpack";
import { Divider, FormText } from ".";

const classes =
  await waitForProps<Record<"labelRow" | "title" | "note" | "dividerDefault", string>>(
    "dividerDefault",
  );

interface CategoryProps {
  title: string;
  open?: boolean;
  note?: string;
  disabled?: boolean;
  onChange?: () => void;
}

export type CategoryType = React.FC<React.PropsWithChildren<CategoryProps>>;

function Category({
  children,
  title,
  open,
  note,
  disabled,
  onChange,
}: React.PropsWithChildren<CategoryProps>): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(open || false);

  const handleClick = (): void => {
    if (disabled) return;

    if (typeof onChange === "function" && typeof open === "boolean") onChange();
    else setIsOpen(!isOpen);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          alignItems: "center",
          display: "flex",
          opacity: disabled ? 0.3 : undefined,
        }}
        onClick={handleClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{
            width: 28,
            height: 28,
            marginRight: 15,
            transition: "transform 0.3s",
            transform: isOpen ? "rotate(90deg)" : undefined,
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
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
              {title}
            </label>
          </div>
          {note && <FormText.DESCRIPTION className={classes.note}>{note}</FormText.DESCRIPTION>}
        </div>
      </div>
      {isOpen ? (
        <div
          style={{
            marginTop: 20,
            marginLeft: 12,
            borderLeft: "1px var(--border-subtle) solid",
            paddingLeft: 33,
            cursor: disabled ? "not-allowed" : undefined,
            opacity: disabled ? 0.3 : undefined,
          }}>
          {children}
        </div>
      ) : (
        <Divider className={classes.dividerDefault} />
      )}
    </div>
  );
}

export default Category;
