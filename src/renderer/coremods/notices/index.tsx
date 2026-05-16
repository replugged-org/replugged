import { React } from "@common";
import { ErrorBoundary } from "@components";
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

function AnnouncementContainer(): React.ReactElement | null {
  const [announcement, setAnnouncement] = React.useState<RepluggedAnnouncement | null>(null);

  React.useEffect(() => {
    const announcementUpdate = (): void => {
      const data = notices.getAnnouncement();
      setAnnouncement(data ?? null);
    };

    notices.addEventListener("rpAnnouncementUpdate", announcementUpdate);
    announcementUpdate();

    return () => {
      notices.removeEventListener("rpAnnouncementUpdate", announcementUpdate);
    };
  }, []);

  if (!announcement) return null;

  return <Announcement {...announcement} />;
}

export function renderAnnouncementContainer(): React.ReactElement {
  return (
    <ErrorBoundary fallback={null}>
      <AnnouncementContainer />
    </ErrorBoundary>
  );
}
