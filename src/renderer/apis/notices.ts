import type { ReCelledAnnouncement } from "../../types";

class NoticesAPI extends EventTarget {
  private announcements: ReCelledAnnouncement[] = [];

  public sendAnnouncement(props: ReCelledAnnouncement): () => void {
    props._dismissed = false;
    this.announcements.push(props);
    this.dispatchEvent(new CustomEvent("rcAnnouncementUpdate"));
    return () => {
      props._dismissed = true;
      this.dispatchEvent(new CustomEvent("rcAnnouncementUpdate"));
    };
  }

  public getAnnouncement(): ReCelledAnnouncement | undefined {
    while (this.announcements[0]?._dismissed) {
      this.announcements.shift();
    }
    return this.announcements[0];
  }

  public closeActiveAnnouncement(): void {
    this.announcements.shift();
    this.dispatchEvent(new CustomEvent("rcAnnouncementUpdate"));
  }
}

export default new NoticesAPI();
