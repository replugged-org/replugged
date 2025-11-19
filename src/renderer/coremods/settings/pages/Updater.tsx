import { React, marginStyles } from "@common";
import { t as discordT, intl } from "@common/i18n";
import { ToastType, toast } from "@common/toast";
import {
  Anchor,
  Button,
  Divider,
  Flex,
  Notice,
  Slider,
  Stack,
  Switch,
  Text,
  Tooltip,
} from "@components";
import { Logger } from "@replugged";
import { plugins } from "src/renderer/managers/plugins";
import { themes } from "src/renderer/managers/themes";
import {
  type UpdateSettings,
  checkAllUpdates,
  getAvailableUpdates,
  installAllUpdates,
  installUpdate,
  updaterSettings,
} from "src/renderer/managers/updater";
import { t } from "src/renderer/modules/i18n";
import { sleep, useSetting, useSettingArray } from "src/renderer/util";
import { UserSettingsForm } from "..";
import Icons from "../icons";
import { getAddonType, label } from "./Addons";

import "./Updater.css";

const logger = Logger.coremod("Settings:Updater");

export function Updater(): React.ReactElement {
  const [checking, setChecking] = React.useState(false);
  const [updatesAvailable, setUpdatesAvailable] =
    React.useState<Array<UpdateSettings & { id: string }>>(getAvailableUpdates());
  const [updatePromises, setUpdatePromises] = React.useState<Record<string, Promise<boolean>>>({});
  const [didInstallAll, setDidInstallAll] = React.useState(false);
  const [autoCheck, setAutoCheck] = useSettingArray(updaterSettings, "autoCheck");
  const [lastChecked, setLastChecked] = useSettingArray(updaterSettings, "lastChecked");

  React.useEffect(() => {
    const promises = Object.entries(updatePromises);

    let cancelled = false;

    promises.forEach(([id, promise]) => {
      promise
        .then(() => {
          if (cancelled) return;
          setUpdatePromises((prev) => {
            const { [id]: _, ...newPromises } = prev;
            return newPromises;
          });
          setUpdatesAvailable(getAvailableUpdates());
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          toast(intl.string(t.REPLUGGED_UPDATES_TOAST_FAILED_ONE), ToastType.FAILURE);
          logger.error(err);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [updatePromises]);

  const hasAnyUpdates = updatesAvailable.length > 0;
  const isAllUpdating = hasAnyUpdates && updatesAvailable.every((u) => u.id in updatePromises);
  const isAnyUpdating = hasAnyUpdates && updatesAvailable.some((u) => u.id in updatePromises);
  const isAllComplete = hasAnyUpdates && updatesAvailable.every((u) => !u.available);
  const isAnyComplete = hasAnyUpdates && updatesAvailable.some((u) => !u.available);
  const isRepluggedDev = window.RepluggedNative.getVersion() === "dev";

  const checkForUpdates = async (): Promise<void> => {
    const previousUpdates = getAvailableUpdates();
    setChecking(true);
    await Promise.all([checkAllUpdates(false, true), sleep(1000)]);
    setChecking(false);
    setLastChecked(Date.now());
    const newUpdates = getAvailableUpdates();
    setUpdatesAvailable(newUpdates);
    if (newUpdates.length > previousUpdates.length) {
      const count = newUpdates.length - previousUpdates.length;
      toast(intl.formatToPlainString(t.REPLUGGED_UPDATES_TOAST_NEW, { count }), ToastType.SUCCESS);
    } else {
      toast(intl.string(t.REPLUGGED_UPDATES_TOAST_NO_NEW), ToastType.SUCCESS);
    }
  };

  const installAll = async (): Promise<void> => {
    setDidInstallAll(true);
    const promises = installAllUpdates(false, true);
    setUpdatePromises(promises);
    const statuses = await Promise.allSettled(Object.values(promises));
    const didAllSucceed = statuses.every((s) => s.status === "fulfilled" && s.value);
    if (didAllSucceed) {
      toast(intl.string(t.REPLUGGED_UPDATES_TOAST_SUCCESS_ALL), ToastType.SUCCESS);
    } else {
      toast(intl.string(t.REPLUGGED_UPDATES_TOAST_FAILED_ALL), ToastType.FAILURE);
    }
  };

  const installOne = async (id: string): Promise<void> => {
    setDidInstallAll(false);
    const promise = installUpdate(id, false, true);
    setUpdatePromises((prev) => ({ ...prev, [id]: promise }));
    const status = await promise.catch(() => false);
    if (status) {
      toast(intl.string(t.REPLUGGED_UPDATES_TOAST_SUCCESS_ONE), ToastType.SUCCESS);
    } else {
      toast(intl.string(t.REPLUGGED_UPDATES_TOAST_FAILED_ONE), ToastType.FAILURE);
    }
  };

  const reload = (): void => {
    window.DiscordNative.app.relaunch();
  };

  return (
    <UserSettingsForm title={intl.string(t.REPLUGGED_UPDATES_UPDATER)}>
      <Switch
        checked={autoCheck}
        onChange={setAutoCheck}
        label={intl.string(t.REPLUGGED_UPDATES_OPTS_AUTO)}
        description={intl.string(t.REPLUGGED_UPDATES_OPTS_AUTO_DESC)}
      />
      <Slider
        {...useSetting(updaterSettings, "checkIntervalMinutes")}
        disabled={!autoCheck}
        label={intl.string(t.REPLUGGED_UPDATES_OPTS_INTERVAL)}
        description={intl.string(t.REPLUGGED_UPDATES_OPTS_INTERVAL_DESC)}
        markers={[10, 20, 30, 40, 50, 60, 60 * 2, 60 * 3, 60 * 4, 60 * 5, 60 * 6, 60 * 12]}
        equidistant
        onMarkerRender={(value) => {
          // Format as xh and/or xm
          const hours = Math.floor(value / 60);
          const minutes = value % 60;

          const hourString =
            hours > 0 ? intl.formatToPlainString(discordT.DURATION_HOURS_SHORT, { hours }) : "";
          const minuteString =
            minutes > 0
              ? intl.formatToPlainString(discordT.DURATION_MINUTES_SHORT, { minutes })
              : "";

          const label = [hourString, minuteString].filter(Boolean).join(" ");
          return label;
        }}
        stickToMarkers
      />
      <Divider />
      {isRepluggedDev && (
        <Notice messageType={Notice.Types.WARNING}>
          {intl.format(t.REPLUGGED_DEVELOPER_MODE_WARNING, {
            url: "https://replugged.dev/download",
          })}
        </Notice>
      )}
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
        <Flex justify={Flex.Justify.CENTER} direction={Flex.Direction.VERTICAL}>
          <Text variant="heading-md/bold" color="header-primary">
            {updatesAvailable.length
              ? intl.format(t.REPLUGGED_UPDATES_AVAILABLE, { count: updatesAvailable.length })
              : intl.string(t.REPLUGGED_UPDATES_UP_TO_DATE)}
          </Text>
          {lastChecked ? (
            <Text.Normal className={marginStyles.marginTop4}>
              {intl.format(t.REPLUGGED_UPDATES_LAST_CHECKED, {
                date: new Date(lastChecked).toLocaleString(intl.currentLocale),
              })}
            </Text.Normal>
          ) : null}
        </Flex>
        {!hasAnyUpdates ? (
          <Button
            onClick={checkForUpdates}
            disabled={isAnyUpdating || isAnyComplete}
            color={checking ? Button.Colors.PRIMARY : Button.Colors.BRAND}
            submitting={checking}>
            {intl.string(t.REPLUGGED_UPDATES_CHECK)}
          </Button>
        ) : isAllComplete && didInstallAll ? (
          <Button onClick={reload} color={Button.Colors.RED}>
            {intl.string(t.REPLUGGED_UPDATES_AWAITING_RELOAD_TITLE)}
          </Button>
        ) : (
          <Button
            onClick={installAll}
            disabled={isAllComplete}
            color={isAllUpdating ? Button.Colors.PRIMARY : Button.Colors.BRAND}
            submitting={isAnyUpdating}>
            {intl.string(t.REPLUGGED_UPDATES_UPDATE_ALL)}
          </Button>
        )}
      </Flex>
      <Stack>
        {updatesAvailable.map((update) => {
          const isReplugged = update.id === "dev.replugged.Replugged";
          const addon =
            plugins.get(update.id) ||
            themes.get(update.id) ||
            (isReplugged
              ? {
                manifest: {
                  type: "replugged",
                  name: "Replugged",
                  version: window.RepluggedNative.getVersion(),
                },
              }
              : null);
          const isUpdating = update.id in updatePromises;
          if (!addon) return null;
          const { manifest } = addon;
          const sourceLink = update.webUrl;
          return (
            <div className="replugged-updater-item" key={update.id}>
              <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
                <div>
                  <Flex
                    align={Flex.Align.CENTER}
                    style={{ gap: "5px" }}
                    className={marginStyles.marginBottom4}>
                    <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
                      <Text variant="heading-md/bold" color="header-primary" tag="span">
                        {manifest.name}
                      </Text>{" "}
                      v{manifest.version}
                    </Text>
                    {sourceLink ? (
                      <Tooltip
                        text={intl.formatToPlainString(t.REPLUGGED_ADDON_PAGE_OPEN, {
                          type: intl.string(discordT.UPDATE_BADGE_HEADER),
                        })}
                        className="replugged-addon-icon replugged-addon-icon-md">
                        <Anchor href={sourceLink}>
                          <Icons.Link />
                        </Anchor>
                      </Tooltip>
                    ) : null}
                  </Flex>
                  <Text.Normal>
                    {intl.format(t.REPLUGGED_UPDATES_UPDATE_TO, {
                      version: `v${update.version}`,
                    })}
                  </Text.Normal>
                </div>
                {update.available ? (
                  <Button
                    onClick={() => installOne(update.id)}
                    color={Button.Colors.PRIMARY}
                    submitting={isUpdating}>
                    {intl.string(discordT.UPDATE)}
                  </Button>
                ) : didInstallAll ? null : (
                  <Button onClick={reload} color={Button.Colors.RED}>
                    {intl.string(t.REPLUGGED_UPDATES_AWAITING_RELOAD_TITLE)}
                  </Button>
                )}
              </Flex>
              {manifest.type !== "replugged" && manifest.updater?.type !== "store" ? (
                <Notice messageType={Notice.Types.ERROR} className={marginStyles.marginTop8}>
                  {intl.format(t.REPLUGGED_ADDON_NOT_REVIEWED_DESC, {
                    type: label(getAddonType(manifest.type)),
                  })}
                </Notice>
              ) : null}
            </div>
          );
        })}
      </Stack>
    </UserSettingsForm>
  );
}

export function UpdaterIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        d="m482-200 114-113-114-113-42 42 43 43q-28 1-54.5-9T381-381q-20-20-30.5-46T340-479q0-17 4.5-34t12.5-33l-44-44q-17 25-25 53t-8 57q0 38 15 75t44 66q29 29 65 43.5t74 15.5l-38 38 42 42Zm165-170q17-25 25-53t8-57q0-38-14.5-75.5T622-622q-29-29-65.5-43T482-679l38-39-42-42-114 113 114 113 42-42-44-44q27 0 55 10.5t48 30.5q20 20 30.5 46t10.5 52q0 17-4.5 34T603-414l44 44ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const UpdaterStrings = (): string[] => [
  intl.string(t.REPLUGGED_UPDATES_UPDATE_ALL),
  intl.string(t.REPLUGGED_UPDATES_CHECK),
  intl.string(discordT.UPDATE),
  intl.string(t.REPLUGGED_UPDATES_UPDATER),
  intl.string(t.REPLUGGED_UPDATES_OPTS_AUTO),
  intl.string(t.REPLUGGED_UPDATES_OPTS_INTERVAL),
  intl.string(t.REPLUGGED_UPDATES_UPDATER),
]
