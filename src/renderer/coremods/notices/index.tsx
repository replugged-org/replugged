import { React } from "@common";
import { notices } from "@recelled";
import { ReCelledAnnouncement } from "src/types";
import NoticeMod from "./noticeMod";

function Announcement({
  message,
  button,
  color,
  onClose,
}: ReCelledAnnouncement): React.ReactElement {
  const { Notice, NoticeButton, NoticeButtonAnchor, NoticeCloseButton } = NoticeMod;

  return (
    <Notice className="recelled-notice" color={color}>
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
  const [announcement, setAnnouncement] = React.useState<ReCelledAnnouncement | undefined>(
    undefined,
  );

  const announcementUpdate = (): void => setAnnouncement(notices.getAnnouncement());

  React.useEffect(() => {
    notices.addEventListener("rcAnnouncementUpdate", announcementUpdate);
    announcementUpdate();

    return () => {
      notices.removeEventListener("rcAnnouncementUpdate", announcementUpdate);
    };
  }, []);

  return announcement && <Announcement {...announcement} />;
}
