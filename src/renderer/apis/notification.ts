import { DISCORD_BLURPLE } from "src/constants";
import type { ButtonItemProps } from "../modules/components/ButtonItem";

export interface NotificationProps {
  id?: string;
  timeout: number;
  origin?: string;
  name?: string;
  color?: string;
  gradient?: [string, string];
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

/**
 * @internal
 * @hidden
 */
export const NotificationHandler = new RPNotificationHandler();

/**
 * Send an in-app notification on discord.
 *
 * @example
 * ```
 * import { NotificationAPI } from "replugged";
 *
 * const notification = NotificationAPI.coremod("Notification");
 *
 * export async function start() {
 *   notification.notify({
 *    header: "Example",
      timeout: 10000,
      content: "This is an example notification!"
    })
 * }
 *
 * export function stop() {
 *   notification.dismissAll();
 * }
 * ```
 */
export class NotificationAPI {
  public origin: string;
  public name: string;
  public color: string;
  private notifications: Array<() => void> = [];

  /**
   *
   * @param origin Origin of the context (e.g. API, Plugin, Coremod...)
   * @param name Name of the context (e.g. Notices, SilentTyping, Badges...)
   * @param color Color of the prefix as hex or a CSS color
   */
  public constructor(origin: string, name: string, color?: string) {
    this.origin = origin;
    this.name = name;
    this.color = color ?? DISCORD_BLURPLE;
  }

  /**
   * A function to send in app notification.
   * @param notification The notification details to show
   * @returns A callback to dismiss the notification
   */
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

  /**
   * Dismiss all notifications made by from this origin
   */
  public dismissAll(): void {
    for (const dismiss of this.notifications) {
      dismiss();
    }
    this.notifications = [];
  }

  /**
   * Convenience method to create a new {@link NotificationAPI} for an API.
   * @internal
   * @param name Name of the API
   * @param color Color of the prefix as hex or a CSS color (default: blurple)
   * @returns {@link NotificationAPI} with origin "API"
   */
  public static api(name: string, color?: string): NotificationAPI {
    return new NotificationAPI("API", name, color);
  }

  /**
   * Convenience method to create a new {@link NotificationAPI} for an coremod.
   * @internal
   * @param name Name of the Coremod
   * @param color Color of the prefix as hex or a CSS color (default: blurple)
   * @returns {@link NotificationAPI} with origin "Coremod"
   */
  public static coremod(name: string, color?: string): NotificationAPI {
    return new NotificationAPI("Coremod", name, color);
  }

  /**
   * Convenience method to create a new {@link NotificationAPI} for an Plugin.
   * @internal
   * @param name Name of the Plugin
   * @param color Color of the prefix as hex or a CSS color (default: blurple)
   * @returns {@link NotificationAPI} with origin "Plugin"
   */
  public static plugin(name: string, color?: string): NotificationAPI {
    return new NotificationAPI("Plugin", name, color);
  }
}
