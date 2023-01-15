import { getByProps, getBySource } from "../../modules/webpack";
import { React } from "@common";
import "./badge.css";
import Badges from "./badges";
import { Tooltip } from "@components";
import { gotoOrJoinServer } from "../../util";

type Clickable = React.FC<
  Record<string, unknown> & {
    "aria-label"?: string;
    className?: string;
    children: React.ReactElement | React.ReactElement[];
    onClick?: () => void;
  }
>;

interface BadgeProps {
  color?: string;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
  children: React.ReactElement;
  gap?: boolean;
  onClick?: () => void;
}

export const Base = ({
  color,
  tooltip,
  tooltipPosition,
  className,
  children,
  gap,
  onClick,
}: BadgeProps): React.ReactElement => {
  // todo: common component
  const Clickable = getBySource("renderNonInteractive") as Clickable | undefined;
  if (!Clickable) {
    throw new Error("Failed to find Clickable component");
  }

  const clickableClass = getByProps<
    "clickable" | "profileBadge",
    Record<"clickable" | "profileBadge", string>
  >("clickable", "profileBadge");
  if (!clickableClass) {
    throw new Error("Failed to find clickable class");
  }

  const badgeClassMod = getByProps<
    "profileBadge22",
    {
      profileBadge22: string;
    }
  >("profileBadge22");
  if (!badgeClassMod) {
    throw new Error("Failed to find badge class");
  }
  const { profileBadge22 } = badgeClassMod;

  const child = (
    <div
      className={`${profileBadge22} replugged-badge ${className || ""}`}
      style={{ color: `#${color || "7289da"}` }}>
      {children}
    </div>
  );
  return (
    <Clickable className={clickableClass.clickable} onClick={onClick || (() => undefined)}>
      {tooltip ? (
        <Tooltip
          text={tooltip}
          position={tooltipPosition || "top"}
          spacing={gap === false ? 0 : 12}>
          {child}
        </Tooltip>
      ) : (
        child
      )}
    </Clickable>
  );
};

interface BadgeArgs {
  color?: string;
  url?: string;
  name?: string;
}

type Badges =
  | "Custom"
  | "Booster"
  | "BugHunter"
  | "Contributor"
  | "Developer"
  | "EarlyUser"
  | "Staff"
  | "Support"
  | "Translator";

export const getBadges = (): Record<
  Badges,
  React.MemoExoticComponent<(args: BadgeArgs) => React.ReactElement>
> => {
  // todo: move to common modules
  const openExternal = getBySource('.target="_blank";') as (url: string) => Promise<void>;
  if (!openExternal) {
    throw new Error("Failed to find openExternal function");
  }

  // todo: make global (configurable?) variables for these
  const openContributorsPage = () => openExternal("https://replugged.dev/contributors");
  const openTranslationsPage = () => openExternal("https://i18n.replugged.dev");
  const joinRepluggedServer = () => gotoOrJoinServer("replugged");

  const Custom = React.memo(({ url, name }: BadgeArgs) => (
    <Base children={<img src={url} style={{ width: "100%", height: "100%" }} />} tooltip={name} />
  ));
  const Booster = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Booster />}
      tooltip={"Replugged Booster"}
      color={color}
      onClick={joinRepluggedServer}
    />
  ));
  const BugHunter = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.BugHunter />} tooltip={"Replugged Bug Hunter"} color={color} />
  ));
  const Contributor = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Contributor />}
      tooltip={"Replugged Contributor"}
      color={color}
      onClick={openContributorsPage}
    />
  ));
  const Developer = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Developer />}
      tooltip={"Replugged Developer"}
      color={color}
      onClick={openContributorsPage}
    />
  ));
  const EarlyUser = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.EarlyUser />} tooltip={"Replugged Early User"} color={color} />
  ));
  const Staff = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Staff />}
      tooltip={"Replugged Staff"}
      color={color}
      onClick={joinRepluggedServer}
    />
  ));
  const Support = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Support />}
      tooltip={"Replugged Support"}
      color={color}
      onClick={joinRepluggedServer}
    />
  ));
  const Translator = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Translator />}
      tooltip={"Replugged Translator"}
      color={color}
      onClick={openTranslationsPage}
    />
  ));

  return {
    Custom,
    Booster,
    BugHunter,
    Contributor,
    Developer,
    EarlyUser,
    Staff,
    Support,
    Translator,
  };
};
