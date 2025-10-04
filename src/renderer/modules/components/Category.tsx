import { React, classNames } from "@common";
import { FormControl } from ".";

import type * as Design from "discord-client-types/discord_app/design/web";

import "./Category.css";

export function ChevronIcon({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
      className={classNames("replugged-category-icon", className)}
      style={{ transform: isOpen ? "rotate(180deg)" : undefined }}>
      <path
        fill="var(--header-primary)"
        d="M5.3 14.7a1 1 0 0 0 1.4 0L12 9.42l5.3 5.3a1 1 0 0 0 1.4-1.42l-6-6a1 1 0 0 0-1.4 0l-6 6a1 1 0 0 0 0 1.42Z"
      />
    </svg>
  );
}

interface CategoryProps
  extends Pick<Design.FormControlProps, "label" | "description" | "disabled"> {
  open?: boolean;
  onChange?: () => void;
}

export type CategoryType = React.FC<React.PropsWithChildren<CategoryProps>>;

function Category({
  children,
  label,
  description,
  open,
  disabled,
  onChange,
}: React.PropsWithChildren<CategoryProps>): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(open || false);

  const handleClick = (): void => {
    if (disabled) return;

    if (onChange && open) onChange();
    else setIsOpen(!isOpen);
  };

  return (
    <div>
      <FormControl label={label} description={description} disabled={disabled} layout="horizontal">
        {({ controlId, describedById, labelId }) => (
          <label
            htmlFor={controlId}
            className={classNames({
              "replugged-category-disabled": disabled,
              "replugged-category-input": !disabled,
            })}>
            <input
              id={controlId}
              type="checkbox"
              checked={isOpen}
              onChange={handleClick}
              aria-describedby={describedById}
              aria-labelledby={labelId}
              disabled={disabled}
              className="replugged-category-hidden-input"
            />
            <ChevronIcon
              isOpen={isOpen}
              className={classNames({ "replugged-category-disabled": disabled })}
            />
          </label>
        )}
      </FormControl>
      {isOpen && !disabled && <div className="replugged-category-content">{children}</div>}
    </div>
  );
}

export default Category;
