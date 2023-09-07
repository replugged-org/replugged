import type { RepluggedAnnouncement } from "../../types";

class NoticesAPI extends EventTarget {
  private announcements: RepluggedAnnouncement[] = [];

  public sendAnnouncement(props: RepluggedAnnouncement): () => void {
    props._dismissed = false;
    this.announcements.push(props);
    this.dispatchEvent(new CustomEvent("rpAnnouncementUpdate"));
    return () => {
      props._dismissed = true;
      this.dispatchEvent(new CustomEvent("rpAnnouncementUpdate"));
    };
  }

  public getAnnouncement(): RepluggedAnnouncement | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (this.announcements?.[0]?._dismissed) {
      this.announcements.shift();
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return this.announcements?.[0];
  }

  public closeActiveAnnouncement(): void {
    this.announcements.shift();
    this.dispatchEvent(new CustomEvent("rpAnnouncementUpdate"));
  }
}

export default new NoticesAPI();
