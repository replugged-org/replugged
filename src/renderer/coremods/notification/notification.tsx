import { React, classNames } from "@common";
import { notification } from "@replugged";
import { Button, Clickable, Progress, Tooltip } from "@components";
import Icons from "./icons";
import type { NotificationPropsWithId } from "../../apis/notification";
import { DISCORD_BLURPLE } from "src/constants";

import "./notification.css";

const predefinedIcons: Record<
  string,
  React.MemoExoticComponent<(props: React.SVGProps<SVGSVGElement>) => React.ReactElement>
> = {
  danger: Icons.Danger,
  info: Icons.Info,
  success: Icons.Success,
  warning: Icons.Warning,
};

function NotificationGradient(hex: string): string[] {
  const hexWithoutHash = hex.replace(/^#/, "");
  const num = parseInt(hexWithoutHash, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const luminance =
    0.2126 * (r / 255) ** 2.2 + 0.7152 * (g / 255) ** 2.2 + 0.0722 * (b / 255) ** 2.2;
  const lightenDarken = luminance > 0.5 ? -175 : 175;
  const newR = Math.min(Math.max(0, r + lightenDarken), 255);
  const newG = Math.min(Math.max(0, g + lightenDarken), 255);
  const newB = Math.min(Math.max(0, b + lightenDarken), 255);
  const newHex = `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, "0")}`;
  return luminance > 0.5 ? [newHex, hex] : [hex, newHex];
}

const Notification = React.memo((
  props: NotificationPropsWithId,
): React.ReactElement | null => {
  const [leaving, setLeaving] = React.useState<boolean>(false);
  const [timeoutState, setTimeoutState] = React.useState<NodeJS.Timeout>();
  const [progress, setProgress] = React.useState<number>(100);
  const [progressState, setProgressState] = React.useState<NodeJS.Timeout>();
  const [timeLeft, setTimeLeft] = React.useState<number>(props.timeout);
  const Icon = props.icon ?? (props.type ? predefinedIcons[props.type] : predefinedIcons.info);
  React.useEffect(() => {
    if (!isNaN(props.timeout)) {
      const timeout = setTimeout(() => {
        setLeaving(true);
        notification.NotificationHandler.closeNotification(props.id);
      }, props.timeout);
      setTimeoutState(timeout);
      setProgressState(
        setInterval(() => {
          setTimeLeft((prev) => prev - 1000);
        }, 1e3),
      );
    }
    return () => {
      clearTimeout(timeoutState);
      clearInterval(progressState);
    };
  }, []);
  React.useEffect(() => {
    setProgress((timeLeft / props.timeout) * 100);
  }, [timeLeft]);

  return (
    <div
      id={props.id}
      className={classNames("replugged-notification", props.type, props.className, {
        leaving,
      })}
      style={props.style}>
      {props.header && (
        <div className="header">
          {props.icon !== false && (
            <Tooltip
              text={`${props.origin}-${props.name}: ${
                props.type
                  ? props.type.replace(
                      /\w\S*/g,
                      (text: string) =>
                        `${text.charAt(0).toUpperCase()}${text.substring(1).toLowerCase()}`,
                    )
                  : "Info"
              }`}>
              <div
                className="icon"
                style={{ color: props.iconColor ?? "var(--interactive-normal)" }}>
                {props.image ? (
                  <img
                    src={props.image}
                    alt=""
                    className={typeof props.imageClassName === "string" ? props.imageClassName : ""}
                  />
                ) : (
                  Icon && <Icon style={{ height: "24px", width: "24px" }} />
                )}
              </div>
            </Tooltip>
          )}
          <span>{props.header}</span>
          <Clickable
            className="dismiss"
            onClick={() => {
              setLeaving(true);
              notification.NotificationHandler.closeNotification(props.id);
            }}>
            <Icons.Close style={{ height: "24px", width: "24px" }} />
          </Clickable>
        </div>
      )}
      {props.content && (
        <div className="contents">
          <div className="inner">{props.content}</div>
        </div>
      )}
      {props.buttons && Array.isArray(props.buttons) && (
        <div className="buttons">
          {props.buttons.map(({ onClick, ...buttonProps }, index: number) => {
            return (
              <Button
                key={`${index}`}
                {...buttonProps}
                onClick={(...args) => {
                  onClick?.(...args);
                  setLeaving(true);
                  notification.NotificationHandler.closeNotification(props.id);
                }}
              />
            );
          })}
        </div>
      )}
      {timeoutState && !props.hideProgressBar && (
        <Progress
          percent={progress}
          animate={true}
          foregroundGradientColor={
            props.gradient ??
            (props.color === DISCORD_BLURPLE
              ? ["#c0164b", "#4e10d2"]
              : NotificationGradient(props.color))
          }
        />
      )}
    </div>
  );
});

export default React.memo((): React.ReactElement | null  => {
  const [toasts, setToasts] = React.useState<NotificationPropsWithId[]>([]);

  const toastsUpdate = (): void => setToasts(notification.NotificationHandler.getNotifications());

  React.useEffect(() => {
    notification.NotificationHandler.addEventListener("rpNotificationUpdate", toastsUpdate);
    toastsUpdate();

    return () => {
      notification.NotificationHandler.removeEventListener("rpNotificationUpdate", toastsUpdate);
    };
  }, []);

  return (
    <div className="replugged-notification-container">
      {Boolean(toasts.length) && toasts.map((props) => <Notification key={props.id} {...props} />)}
    </div>
  );
});
