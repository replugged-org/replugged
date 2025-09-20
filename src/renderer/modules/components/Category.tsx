import { React, classNames, marginStyles } from "@common";
import { waitForProps } from "@webpack";
import { Divider, Flex, FormText } from ".";

import type { FormSwitchStyles } from "discord-client-types/discord_app/design/components/Forms/web/FormSwitch.module";

import "./Category.css";

const classes = await waitForProps<Record<FormSwitchStyles, string>>("dividerDefault");

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
      style={{ transform: isOpen ? "rotate(90deg)" : undefined }}>
      <path
        fill="var(--header-primary)"
        d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"
      />
    </svg>
  );
}

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

    if (onChange && open) onChange();
    else setIsOpen(!isOpen);
  };

  return (
    <div
      className={classNames(marginStyles.marginBottom20, {
        [classes.disabled]: disabled,
      })}>
      <Flex align={Flex.Align.CENTER} onClick={handleClick}>
        <ChevronIcon
          isOpen={isOpen}
          className={classNames({ "replugged-category-disabled": disabled })}
        />
        <Flex direction={Flex.Direction.VERTICAL}>
          <Flex align={Flex.Align.CENTER} direction={Flex.Direction.HORIZONTAL}>
            <label className={classes.title}>{title}</label>
          </Flex>
          {note && (
            <FormText.DESCRIPTION disabled={disabled} className={classes.note}>
              {note}
            </FormText.DESCRIPTION>
          )}
        </Flex>
      </Flex>
      {isOpen ? (
        <div
          className={classNames("replugged-category-content", {
            "replugged-category-disabled": disabled,
          })}>
          {children}
        </div>
      ) : (
        <Divider className={classes.dividerDefault} />
      )}
    </div>
  );
}

export default Category;
