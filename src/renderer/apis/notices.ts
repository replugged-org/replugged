import API from './api';
import { RepluggedAnnouncement, RepluggedToast } from '../../types';

export default class NoticesAPI extends API {
  announcements: {
    [id: string]: RepluggedAnnouncement
  } = {};

  toasts: {
    [id: string]: RepluggedToast
  } = {};

  sendAnnouncement (id: string, props: RepluggedAnnouncement): void {
    if (this.announcements[id]) {
      return this.error(`ID: ${id} is already in use by another announcement.`);
    }

    this.announcements[id] = props;
    this.dispatchEvent(new CustomEvent('rpAnnouncementCreate', { detail: { id } }));
  }

  closeAnnouncement (id: string): void {
    if (this.announcements[id]) {
      delete this.announcements[id];
      this.dispatchEvent(new CustomEvent('rpAnnouncementClose', { detail: { id } }));
    }
  }

  sendToast (id: string, props: RepluggedToast): void {
    if (this.toasts[id]) {
      return this.error(`ID: ${id} is already in use by another toast.`);
    }

    this.toasts[id] = props;
    this.dispatchEvent(new CustomEvent('rpToastCreate', { detail: { id } }));
  }

  closeToast (id: string): void {
    const toast = this.toasts[id];
    if (!toast) {
      return;
    }

    this.dispatchEvent(new CustomEvent('rpToastClose', { detail: { id } }));
  }
}
