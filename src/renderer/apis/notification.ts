import type { ButtonItemProps } from "../modules/components/ButtonItem";
export interface NotificationProps {
  id?: string;
  timeout: number;
  origin?: string;
  name?: string;
  color?: string;
  iconColor?: string;
  imageClassName?: string | undefined;
  header: React.ReactNode;
  content: React.ReactNode;
  image: string;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | false;
  buttons?: ButtonItemProps[];
  className?: string;
  style?: React.CSSProperties;
  hideProgressBar?: boolean;
  type?: string;
}
export interface NotificationPropsWithId extends NotificationProps {
  id: string;
  origin: string;
  name: string;
  color: string;
}
class RPNotificationHandler extends EventTarget {
  private notifications = new Map<string, NotificationPropsWithId>();

  public sendNotification(notification: NotificationPropsWithId): () => void {
    this.notifications.set(notification.id, notification);
    this.dispatchEvent(new CustomEvent("rpNotificationUpdate"));
    return () => {
      this.notifications.delete(notification.id);
      this.dispatchEvent(new CustomEvent("rpNotificationUpdate"));
    };
  }

  public getNotifications(): NotificationPropsWithId[] {
    return Array.from(this.notifications.values());
  }

  public closeNotification(id: string): void {
    this.notifications.delete(id);
    this.dispatchEvent(new CustomEvent("rpNotificationUpdate"));
  }
}
export const NotificationHandler = new RPNotificationHandler();

export class NotificationAPI {
  public origin: string;
  public name: string;
  public color: string;
  private notifications: Array<() => void> = [];

  public constructor(origin: string, name: string, color?: string) {
    this.origin = origin;
    this.name = name;
    this.color = color ?? "#5864f2";
  }

  public notify(notification: NotificationProps): () => void {
    notification.name = this.name;
    notification.origin = this.origin;
    notification.type ??= "info";
    notification.color ??= this.color;
    notification.id = `${this.origin}-${this.name}-${notification.type} -${Date.now()}`;
    const dismiss = NotificationHandler.sendNotification(notification as NotificationPropsWithId);
    this.notifications.push(dismiss);
    return () => {
      dismiss();
      this.notifications = this.notifications.filter((f) => f !== dismiss);
    };
  }

  public dismissAll(): void {
    for (const dismiss of this.notifications) {
      dismiss();
    }
    this.notifications = [];
  }

  public static api(name: string, color?: string): NotificationAPI {
    return new NotificationAPI("API", name, color);
  }

  public static coremod(name: string, color?: string): NotificationAPI {
    return new NotificationAPI("Coremod", name, color);
  }

  public static plugin(name: string, color?: string): NotificationAPI {
    return new NotificationAPI("Plugin", name, color);
  }
}
