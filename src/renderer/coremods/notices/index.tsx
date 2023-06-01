import { Injector, Logger, notices } from "@replugged";
import { React } from "@common";
import { filters, waitForModule, waitForProps } from "src/renderer/modules/webpack";
import { Tree, findInReactTree, getOwnerInstance, waitFor } from "src/renderer/util";
import { RepluggedAnnouncement, RepluggedAnnouncementColors } from "src/types";
import { Clickable } from "@components";

const injector = new Injector();
const logger = Logger.coremod("Notices");

type NoticeColorKeys =
  | "notice"
  | "isMobile"
  | "colorDefault"
  | "button"
  | "colorNeutral"
  | "colorPremium"
  | "colorPremiumTier0"
  | "colorPremiumTier1"
  | "colorPremiumTier2"
  | "colorInfo"
  | "colorSuccess"
  | "colorWarning"
  | "closeIcon"
  | "colorDanger"
  | "colorStreamerMode"
  | "colorSpotify"
  | "platformIcon"
  | "colorPlayStation"
  | "colorBrand"
  | "colorCustom"
  | "closeButton"
  | "buttonMinor";

type NoticeColorsMod = Record<NoticeColorKeys, string>;

let noticeClassMod: NoticeColorsMod;
let CloseButton: React.ComponentType<{
  width?: number;
  height?: number;
  className?: string;
}>;

function Announcement({
  message,
  button,
  color,
  onClose,
}: RepluggedAnnouncement): React.ReactElement {
  const classes = [
    "replugged-notice",
    noticeClassMod.notice,
    noticeClassMod[color ?? RepluggedAnnouncementColors.Default],
  ].join(" ");

  return (
    <div className={classes}>
      {message}
      <Clickable
        className={noticeClassMod.closeButton}
        onClick={() => {
          onClose?.();
          notices.closeActiveAnnouncement();
        }}>
        <CloseButton width={18} height={18} className={noticeClassMod.closeIcon} />
      </Clickable>
      {button ? (
        <button
          className={noticeClassMod.button}
          onClick={() => {
            button.onClick?.();
            notices.closeActiveAnnouncement();
          }}>
          {button.text}
        </button>
      ) : null}
    </div>
  );
}

function AnnouncementContainer({
  originalRes,
}: {
  originalRes: React.ReactElement;
}): React.ReactElement | null {
  const [announcement, setAnnouncement] = React.useState<RepluggedAnnouncement | undefined>(
    undefined,
  );

  const announcementUpdate = (): void => setAnnouncement(notices.getAnnouncement());

  React.useEffect(() => {
    notices.addEventListener("rpAnnouncementUpdate", announcementUpdate);
    announcementUpdate();

    return () => {
      notices.removeEventListener("rpAnnouncementUpdate", announcementUpdate);
    };
  }, []);

  return announcement ? <Announcement {...announcement} /> : originalRes;
}

export async function init(): Promise<void> {
  noticeClassMod = await waitForProps<NoticeColorsMod>("colorPremiumTier1");
  CloseButton = await waitForModule(filters.bySource("M18.4 4L12"));
  const { base } = await waitForProps<Record<"base" | "container", string>>("base", "container");

  const baseEl = await waitFor(`.${base}`);
  const instance = getOwnerInstance(baseEl) as unknown as {
    render: () => {
      props: {
        children: {
          type: () => Tree;
        };
      };
    };
  };
  let uninjectLastBase: () => void;
  injector.after(instance, "render", (_, res) => {
    if (!res) return;
    uninjectLastBase?.();
    uninjectLastBase = injector.after(res.props.children, "type", (_, res) => {
      const baseObj = findInReactTree(res, (c) => c?.className === base) as {
        children: React.ReactElement[];
      };
      baseObj.children[0] = <AnnouncementContainer originalRes={baseObj.children[0]} />;
      logger.log("Injected announcement container");
    });
  });
}

export async function start(): Promise<void> {
  await init();
}

export function stop(): void {
  injector.uninjectAll();
}
