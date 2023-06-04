import { React } from "@common";
import { Injector, Logger, notices } from "@replugged";
import { waitForProps } from "src/renderer/modules/webpack";
import { Tree, findInReactTree, getOwnerInstance, waitFor } from "src/renderer/util";
import { RepluggedAnnouncement } from "src/types";
import NoticeMod from "./noticeMod";

const { Notice, NoticeButton, NoticeButtonAnchor, NoticeCloseButton } = NoticeMod;

const injector = new Injector();
const logger = Logger.coremod("Notices");

function Announcement({
  message,
  button,
  color,
  onClose,
}: RepluggedAnnouncement): React.ReactElement {
  return (
    <Notice className="replugged-notice" color={color}>
      <NoticeCloseButton
        onClick={() => {
          onClose?.();
          notices.closeActiveAnnouncement();
        }}
      />
      {message}
      {button ? (
        button.href ? (
          <NoticeButtonAnchor href={button.href}>{button.text}</NoticeButtonAnchor>
        ) : (
          <NoticeButton
            onClick={() => {
              button.onClick?.();
              notices.closeActiveAnnouncement();
            }}>
            {button.text}
          </NoticeButton>
        )
      ) : null}
    </Notice>
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
