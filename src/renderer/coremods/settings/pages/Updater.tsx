import { React, i18n, toast } from "@common";
import { Button, Divider, Flex, Notice, SliderItem, SwitchItem, Text, Tooltip } from "@components";
import { Logger } from "@recelled";
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
import Icons from "../icons";
import { getAddonType, label } from "./Addons";

import "./Updater.css";

const { intl } = i18n;

const logger = Logger.coremod("Settings:Updater");

export const Updater = (): React.ReactElement => {
  const [checking, setChecking] = React.useState(false);
  const [updatesAvailable, setUpdatesAvailable] =
    React.useState<Array<UpdateSettings & { id: string }>>(getAvailableUpdates());
  const [updatePromises, setUpdatePromises] = React.useState<Record<string, Promise<boolean>>>({});
  const [didInstallAll, setDidInstallAll] = React.useState(false);
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
        .catch((err) => {
          if (cancelled) return;
          toast.toast("Update failed.", toast.Kind.FAILURE);
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
  const isReCelledDev = window.ReCelledNative.getVersion() === "dev";

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
      toast.toast(
        intl.formatToPlainString(t.RECELLED_UPDATES_TOAST_NEW, { count }),
        toast.Kind.SUCCESS,
      );
    } else {
      toast.toast(intl.string(t.RECELLED_UPDATES_TOAST_NO_NEW), toast.Kind.SUCCESS);
    }
  };

  const installAll = async (): Promise<void> => {
    setDidInstallAll(true);
    const promises = installAllUpdates(false, true);
    setUpdatePromises(promises);
    const statuses = await Promise.allSettled(Object.values(promises));
    const didAllSucceed = statuses.every((s) => s.status === "fulfilled" && s.value);
    if (didAllSucceed) {
      toast.toast(intl.string(t.RECELLED_UPDATES_TOAST_SUCCESS_ALL), toast.Kind.SUCCESS);
    } else {
      toast.toast(intl.string(t.RECELLED_UPDATES_TOAST_FAILED_ALL), toast.Kind.FAILURE);
    }
  };

  const installOne = async (id: string): Promise<void> => {
    setDidInstallAll(false);
    const promise = installUpdate(id, false, true);
    setUpdatePromises((prev) => ({ ...prev, [id]: promise }));
    const status = await promise.catch(() => false);
    if (status) {
      toast.toast(intl.string(t.RECELLED_UPDATES_TOAST_SUCCESS_ONE), toast.Kind.SUCCESS);
    } else {
      toast.toast(intl.string(t.RECELLED_UPDATES_TOAST_FAILED_ONE), toast.Kind.FAILURE);
    }
  };

  const reload = (): void => {
    window.DiscordNative.app.relaunch();
  };

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2>{intl.string(t.RECELLED_UPDATES_UPDATER)}</Text.H2>
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      <SwitchItem
        {...useSetting(updaterSettings, "autoCheck")}
        note={intl.string(t.RECELLED_UPDATES_OPTS_AUTO_DESC)}>
        {intl.string(t.RECELLED_UPDATES_OPTS_AUTO)}
      </SwitchItem>
      <SliderItem
        {...useSetting(updaterSettings, "checkIntervalMinutes")}
        disabled={!updaterSettings.get("autoCheck")}
        note={intl.string(t.RECELLED_UPDATES_OPTS_INTERVAL_DESC)}
        markers={[10, 20, 30, 40, 50, 60, 60 * 2, 60 * 3, 60 * 4, 60 * 5, 60 * 6, 60 * 12]}
        equidistant={true}
        onMarkerRender={(value) => {
          // Format as xh and/or xm
          const hours = Math.floor(value / 60);
          const minutes = value % 60;

          const hourString = hours > 0 ? `${hours}h` : "";
          const minuteString = minutes > 0 ? `${minutes}m` : "";

          const label = [hourString, minuteString].filter(Boolean).join(" ");
          return label;
        }}
        stickToMarkers={true}>
        {intl.string(t.RECELLED_UPDATES_OPTS_INTERVAL)}
      </SliderItem>
      {isReCelledDev && (
        <div style={{ marginBottom: "16px" }}>
          <Notice messageType={Notice.Types.WARNING}>
            {intl.format(t.RECELLED_DEVELOPER_MODE_WARNING, {
              url: "https://replugged.dev/download",
            })}
          </Notice>
        </div>
      )}
      <Flex
        justify={Flex.Justify.BETWEEN}
        align={Flex.Align.CENTER}
        className="recelled-updater-header">
        <Flex justify={Flex.Justify.CENTER} direction={Flex.Direction.VERTICAL}>
          <Text variant="heading-md/bold" color="header-primary">
            {updatesAvailable.length
              ? intl.format(t.RECELLED_UPDATES_AVAILABLE, { count: updatesAvailable.length })
              : intl.string(t.RECELLED_UPDATES_UP_TO_DATE)}
          </Text>
          {lastChecked ? (
            <Text.Normal style={{ marginTop: "5px" }}>
              {intl.format(t.RECELLED_UPDATES_LAST_CHECKED, {
                date: new Date(lastChecked).toLocaleString(intl.currentLocale),
              })}
            </Text.Normal>
          ) : null}
        </Flex>
        {!hasAnyUpdates ? (
          <Button
            className="recelled-updater-check"
            onClick={checkForUpdates}
            disabled={isAnyUpdating || isAnyComplete}
            color={checking ? Button.Colors.PRIMARY : Button.Colors.BRAND}
            submitting={checking}>
            {intl.string(t.RECELLED_UPDATES_CHECK)}
          </Button>
        ) : isAllComplete && didInstallAll ? (
          <Button onClick={reload} color={Button.Colors.RED}>
            {intl.string(t.RECELLED_UPDATES_AWAITING_RELOAD_TITLE)}
          </Button>
        ) : (
          <Button
            onClick={installAll}
            disabled={isAllComplete}
            color={isAllUpdating ? Button.Colors.PRIMARY : Button.Colors.BRAND}
            submitting={isAnyUpdating}>
            {intl.string(t.RECELLED_UPDATES_UPDATE_ALL)}
          </Button>
        )}
      </Flex>
      <Flex className="recelled-updater-items" direction={Flex.Direction.VERTICAL}>
        {updatesAvailable.map((update) => {
          const isReCelled = update.id === "dev.recelled.ReCelled";
          const addon =
            plugins.get(update.id) ||
            themes.get(update.id) ||
            (isReCelled
              ? {
                  manifest: {
                    type: "recelled",
                    name: "ReCelled",
                    version: window.ReCelledNative.getVersion(),
                  },
                }
              : null);
          const isUpdating = update.id in updatePromises;
          if (!addon) return null;
          const { manifest } = addon;
          const sourceLink = update.webUrl;
          return (
            <div className="recelled-updater-item">
              <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.CENTER}>
                <div>
                  <Flex align={Flex.Align.CENTER} style={{ gap: "5px", marginBottom: "5px" }}>
                    <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
                      <Text variant="heading-md/bold" color="header-primary" tag="span">
                        {manifest.name}
                      </Text>{" "}
                      v{manifest.version}
                    </Text>
                    {sourceLink ? (
                      <Tooltip
                        text={intl.formatToPlainString(t.RECELLED_ADDON_PAGE_OPEN, {
                          type: intl.string(t.RECELLED_UPDATES_UPDATE_NOUN),
                        })}
                        className="recelled-addon-icon recelled-addon-icon-md">
                        <a href={sourceLink} target="_blank" rel="noopener noreferrer">
                          <Icons.Link />
                        </a>
                      </Tooltip>
                    ) : null}
                  </Flex>
                  <Text.Normal>
                    {intl.format(t.RECELLED_UPDATES_UPDATE_TO, { version: `v${update.version}` })}
                  </Text.Normal>
                </div>
                {update.available ? (
                  <Button
                    onClick={() => installOne(update.id)}
                    color={Button.Colors.PRIMARY}
                    submitting={isUpdating}>
                    {intl.string(t.RECELLED_UPDATES_UPDATE)}
                  </Button>
                ) : didInstallAll ? null : (
                  <Button onClick={reload} color={Button.Colors.RED}>
                    {intl.string(t.RECELLED_UPDATES_AWAITING_RELOAD_TITLE)}
                  </Button>
                )}
              </Flex>
              {manifest.type !== "recelled" && manifest.updater?.type !== "store" ? (
                <div style={{ marginTop: "8px" }}>
                  <Notice messageType={Notice.Types.ERROR}>
                    {intl.format(t.RECELLED_ADDON_NOT_REVIEWED_DESC, {
                      type: label(getAddonType(manifest.type)),
                    })}
                  </Notice>
                </div>
              ) : null}
            </div>
          );
        })}
      </Flex>
    </>
  );
};
