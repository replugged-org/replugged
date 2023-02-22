import { filters, getByProps, waitForModule } from "../../modules/webpack";
import { React } from "@common";
import { Messages } from "@common/i18n";
import "./badge.css";
import Badges from "./badges";
import { Clickable, Tooltip } from "@components";
import { goToOrJoinServer } from "../../util";
import { RawModule } from "src/types";

interface BadgeProps {
  color?: string;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "center" | "window_center";
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

// todo: move to common modules
const openExternal = (url: string): Promise<void> =>
  waitForModule<RawModule & ((url: string) => Promise<void>)>(
    filters.bySource('.target="_blank";'),
  ).then((module) => module(url));

// todo: make global (configurable?) variables for these
const openContributorsPage = (): Promise<void> =>
  openExternal("https://replugged.dev/contributors");
const openTranslationsPage = (): Promise<void> => openExternal("https://i18n.replugged.dev");
const joinRepluggedServer = (): Promise<void> => goToOrJoinServer("replugged");

const Custom = React.memo(({ url, name }: BadgeArgs) => (
  <Base children={<img src={url} style={{ width: "100%", height: "100%" }} />} tooltip={name} />
));
const Booster = React.memo(({ color }: BadgeArgs) => (
  <Base
    children={<Badges.Booster />}
    tooltip={Messages.REPLUGGED_BADGES_BOOSTER}
    color={color}
    onClick={joinRepluggedServer}
  />
));
const BugHunter = React.memo(({ color }: BadgeArgs) => (
  <Base children={<Badges.BugHunter />} tooltip={Messages.REPLUGGED_BADGES_HUNTER} color={color} />
));
const Contributor = React.memo(({ color }: BadgeArgs) => (
  <Base
    children={<Badges.Contributor />}
    tooltip={Messages.REPLUGGED_BADGES_CONTRIBUTOR}
    color={color}
    onClick={openContributorsPage}
  />
));
const Developer = React.memo(({ color }: BadgeArgs) => (
  <Base
    children={<Badges.Developer />}
    tooltip={Messages.REPLUGGED_BADGES_DEVELOPER}
    color={color}
    onClick={openContributorsPage}
  />
));
const EarlyUser = React.memo(({ color }: BadgeArgs) => (
  <Base children={<Badges.EarlyUser />} tooltip={Messages.REPLUGGED_BADGES_EARLY} color={color} />
));
const Staff = React.memo(({ color }: BadgeArgs) => (
  <Base
    children={<Badges.Staff />}
    tooltip={Messages.REPLUGGED_BADGES_STAFF}
    color={color}
    onClick={joinRepluggedServer}
  />
));
const Support = React.memo(({ color }: BadgeArgs) => (
  <Base
    children={<Badges.Support />}
    tooltip={Messages.REPLUGGED_BADGES_SUPPORT}
    color={color}
    onClick={joinRepluggedServer}
  />
));
const Translator = React.memo(({ color }: BadgeArgs) => (
  <Base
    children={<Badges.Translator />}
    tooltip={Messages.REPLUGGED_BADGES_TRANSLATOR}
    color={color}
    onClick={openTranslationsPage}
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
