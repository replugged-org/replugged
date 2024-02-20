import { Messages } from "@common/i18n";
import React from "@common/react";
import { Clickable, Tooltip } from "@components";
import { getByProps } from "../../modules/webpack";
import { goToOrJoinServer, openExternal } from "../../util";
import { generalSettings } from "../settings/pages";
import "./badge.css";
import Badges from "./badges";

export enum BadgeSizes {
  SIZE_24,
  SIZE_22,
  SIZE_18,
}

interface BadgeProps {
  color?: string;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "center" | "window_center";
  className?: string;
  children: React.ReactElement;
  gap?: boolean;
  size?: BadgeSizes;
  onClick?: () => void;
}

export function getBadgeSizeClass(size?: BadgeSizes): string {
  const badgeClassMod =
    getByProps<Record<"profileBadge24" | "profileBadge22" | "profileBadge18", string>>(
      "profileBadge22",
    );
  if (!badgeClassMod) {
    throw new Error("Failed to find badge class");
  }
  const { profileBadge24, profileBadge22, profileBadge18 } = badgeClassMod;

  switch (size) {
    case BadgeSizes.SIZE_24:
      return profileBadge24;
    case BadgeSizes.SIZE_22:
      return profileBadge22;
    case BadgeSizes.SIZE_18:
      return profileBadge18;
    default:
      return profileBadge24;
  }
}

export const Base = (props: BadgeProps): React.ReactElement => {
  const { color, tooltip, tooltipPosition, className, children, gap, size, onClick } = props;

  let sizeClass = getBadgeSizeClass(size);

  const child = (
    <div
      className={`${sizeClass} replugged-badge${className ? ` ${className}` : ""}`}
      style={{ color: `#${color || "7289da"}` }}>
      {children}
    </div>
  );

  return (
    <Clickable onClick={onClick}>
      {tooltip ? (
        <Tooltip
          text={tooltip}
          position={tooltipPosition || Tooltip.Positions.TOP}
          spacing={gap === false ? 0 : 12}>
          {child}
        </Tooltip>
      ) : (
        child
      )}
    </Clickable>
  );
};

export interface BadgeArgs {
  color?: string;
  url?: string;
  name?: string;
  size?: BadgeSizes;
}

export interface APIBadges {
  developer?: boolean;
  staff?: boolean;
  support?: boolean;
  contributor?: boolean;
  translator?: boolean;
  hunter?: boolean;
  early?: boolean;
  booster?: boolean;
  custom?: {
    name: string;
    icon?: string;
    color?: string;
  };
}

export type BadgeComponent = (args: BadgeArgs) => React.ReactElement<{
  children: React.ReactElement[];
  className: string;
}>;

// todo: make global (configurable?) variables for these
const openContributorsPage = (): Promise<void> =>
  openExternal(`${generalSettings.get("apiUrl")}/contributors`);
const openTranslationsPage = (): Promise<void> => openExternal("https://i18n.replugged.dev");
const joinRepluggedServer = (): Promise<void> => goToOrJoinServer("HnYFUhv4x4");

const Custom = React.memo(({ url, name, size }: BadgeArgs) => (
  <Base
    children={<img src={url} style={{ width: "100%", height: "100%" }} />}
    tooltip={name}
    size={size}
  />
));
const Booster = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.Booster />}
    tooltip={Messages.REPLUGGED_BADGES_BOOSTER}
    color={color}
    onClick={joinRepluggedServer}
    size={size}
  />
));
const BugHunter = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.BugHunter />}
    tooltip={Messages.REPLUGGED_BADGES_HUNTER}
    color={color}
    size={size}
  />
));
const Contributor = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.Contributor />}
    tooltip={Messages.REPLUGGED_BADGES_CONTRIBUTOR}
    color={color}
    onClick={openContributorsPage}
    size={size}
  />
));
const Developer = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.Developer />}
    tooltip={Messages.REPLUGGED_BADGES_DEVELOPER}
    color={color}
    onClick={openContributorsPage}
    size={size}
  />
));
const EarlyUser = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.EarlyUser />}
    tooltip={Messages.REPLUGGED_BADGES_EARLY}
    color={color}
    size={size}
  />
));
const Staff = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.Staff />}
    tooltip={Messages.REPLUGGED_BADGES_STAFF}
    color={color}
    onClick={joinRepluggedServer}
    size={size}
  />
));
const Support = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.Support />}
    tooltip={Messages.REPLUGGED_BADGES_SUPPORT}
    color={color}
    onClick={joinRepluggedServer}
    size={size}
  />
));
const Translator = React.memo(({ color, size }: BadgeArgs) => (
  <Base
    children={<Badges.Translator />}
    tooltip={Messages.REPLUGGED_BADGES_TRANSLATOR}
    color={color}
    onClick={openTranslationsPage}
    size={size}
  />
));

const badgeElements: Array<{
  type: keyof APIBadges;
  component: React.MemoExoticComponent<BadgeComponent>;
}> = [
  { type: "staff", component: Staff },
  { type: "support", component: Support },
  { type: "developer", component: Developer },
  { type: "contributor", component: Contributor },
  { type: "translator", component: Translator },
  { type: "hunter", component: BugHunter },
  { type: "booster", component: Booster },
  { type: "early", component: EarlyUser },
];

export { badgeElements, Custom };
