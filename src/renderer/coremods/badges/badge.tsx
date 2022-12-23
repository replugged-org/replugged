import {
  filters,
  getByProps,
  getBySource,
  getFunctionBySource,
  waitForModule,
} from "../../modules/webpack";
import React from "../../modules/webpack/common/react";
import "./badge.css";
import Badges from "./badges";

type Tooltip = React.FC<{
  text?: string;
  position?: "top" | "bottom" | "left" | "right";
  spacing?: number;
  children: (props: React.HTMLAttributes<HTMLSpanElement>) => React.ReactElement;
}>;

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

export const getBadgeComponent = async (): Promise<(args: BadgeProps) => React.ReactElement> => {
  const tooltipMod = await waitForModule<Record<string, Tooltip>>(
    filters.bySource(/shouldShowTooltip:!1/),
  );

  // todo: common component
  const Tooltip = tooltipMod && getFunctionBySource<Tooltip>(/shouldShowTooltip:!1/, tooltipMod);
  if (!Tooltip) {
    throw new Error("Failed to find Tooltip component");
  }

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

  return ({ color, tooltip, tooltipPosition, className, children, gap, onClick }: BadgeProps) => {
    return (
      <Clickable className={clickableClass.clickable} onClick={onClick || (() => undefined)}>
        <Tooltip
          text={tooltip}
          position={tooltipPosition || "top"}
          spacing={gap === false ? 0 : 12}>
          {(props) => (
            <span {...props}>
              <div
                className={`${profileBadge22} replugged-badge ${className || ""}`}
                style={{ color: `#${color || "7289da"}` }}>
                {children}
              </div>
            </span>
          )}
        </Tooltip>
      </Clickable>
    );
  };
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

export const getBadges = async (): Promise<
  Record<Badges, React.MemoExoticComponent<(args: BadgeArgs) => React.ReactElement>>
> => {
  const Base = await getBadgeComponent();

  // todo: move to common modules
  const openExternal = getBySource('.target="_blank";') as (url: string) => Promise<void>;
  if (!openExternal) {
    throw new Error("Failed to find openExternal function");
  }

  // todo: make gotoOrJoinServer, implement here

  // todo: i18n
  const Custom = React.memo(({ url, name }: BadgeArgs) => (
    <Base children={<img src={url} style={{ width: "100%", height: "100%" }} />} tooltip={name} />
  ));
  const Booster = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.Booster />} tooltip={"Replugged Booster"} color={color} />
  ));
  const BugHunter = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.BugHunter />} tooltip={"Replugged Bug Hunter"} color={color} />
  ));
  const Contributor = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Contributor />}
      tooltip={"Replugged Contributor"}
      color={color}
      // todo: website var
      onClick={() => openExternal("https://replugged.dev/contributors")}
    />
  ));
  const Developer = React.memo(({ color }: BadgeArgs) => (
    <Base
      children={<Badges.Developer />}
      tooltip={"Replugged Developer"}
      color={color}
      // todo: website var
      onClick={() => openExternal("https://replugged.dev/contributors")}
    />
  ));
  const EarlyUser = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.EarlyUser />} tooltip={"Replugged Early User"} color={color} />
  ));
  const Staff = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.Staff />} tooltip={"Replugged Staff"} color={color} />
  ));
  const Support = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.Support />} tooltip={"Replugged Support"} color={color} />
  ));
  const Translator = React.memo(({ color }: BadgeArgs) => (
    <Base children={<Badges.Translator />} tooltip={"Replugged Translator"} color={color} />
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
