import API from "../entities/api";
import { RepluggedAnnouncement, RepluggedToast } from "../../types";

class NoticesAPI extends API {
  public announcements = new Map<string, RepluggedAnnouncement>();
  public toasts = new Map<string, RepluggedToast>();

  public constructor() {
    super("dev.replugged.apis.Notices", "Notices");
  }

  public sendAnnouncement(id: string, props: RepluggedAnnouncement): void {
    if (this.announcements.has(id)) {
      this.error(`ID: ${id} is already in use by another announcement.`);
      return;
    }

    this.announcements.set(id, props);
    this.dispatchEvent(new CustomEvent("rpAnnouncementCreate", { detail: { id } }));
  }

  public closeAnnouncement(id: string): void {
    if (this.announcements.has(id)) {
      this.announcements.delete(id);
      this.dispatchEvent(new CustomEvent("rpAnnouncementClose", { detail: { id } }));
    }
  }

  public sendToast(id: string, props: RepluggedToast): void {
    if (this.toasts.has(id)) {
      this.error(`ID: ${id} is already in use by another toast.`);
      return;
    }

    this.toasts.set(id, props);
    this.dispatchEvent(new CustomEvent("rpToastCreate", { detail: { id } }));
  }

  public closeToast(id: string): void {
    if (this.toasts.has(id)) {
      this.toasts.delete(id);
      this.dispatchEvent(new CustomEvent("rpToastClose", { detail: { id } }));
    }
  }
}

export default new NoticesAPI();
