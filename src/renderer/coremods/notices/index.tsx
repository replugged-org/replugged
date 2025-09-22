import { React } from "@common";
import { notices } from "@replugged";
import type { RepluggedAnnouncement } from "src/types";
import NoticeMod from "./noticeMod";

import "./RepluggedNotice.css";

const { Notice, NoticeButton, NoticeButtonAnchor, NoticeCloseButton } = NoticeMod;

function Announcement({
  message,
  button,
  color,
  onClose,
}: RepluggedAnnouncement): React.ReactElement {
  return (
    <Notice color={color ?? "replugged-notice"}>
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

export function AnnouncementContainer(): React.ReactElement | undefined {
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

  return announcement && <Announcement {...announcement} />;
}
