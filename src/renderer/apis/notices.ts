import API from '../entities/api';
import { RepluggedAnnouncement, RepluggedToast } from '../../types';

class NoticesAPI extends API {
  announcements = new Map<string, RepluggedAnnouncement>();
  toasts = new Map<string, RepluggedToast>();

  constructor () {
    super('Notices');
  }

  sendAnnouncement (id: string, props: RepluggedAnnouncement): void {
    if (this.announcements.has(id)) {
      return this.error(`ID: ${id} is already in use by another announcement.`);
    }

    this.announcements.set(id, props);
    this.dispatchEvent(new CustomEvent('rpAnnouncementCreate', { detail: { id } }));
  }

  closeAnnouncement (id: string): void {
    if (this.announcements.has(id)) {
      this.announcements.delete(id);
      this.dispatchEvent(new CustomEvent('rpAnnouncementClose', { detail: { id } }));
    }
  }

  sendToast (id: string, props: RepluggedToast): void {
    if (this.toasts.has(id)) {
      return this.error(`ID: ${id} is already in use by another toast.`);
    }

    this.toasts.set(id, props);
    this.dispatchEvent(new CustomEvent('rpToastCreate', { detail: { id } }));
  }

  closeToast (id: string): void {
    if (this.toasts.has(id)) {
      this.toasts.delete(id);
      this.dispatchEvent(new CustomEvent('rpToastClose', { detail: { id } }));
    }
  }
}

export default new NoticesAPI();
