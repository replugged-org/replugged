import { toast } from "@common";
import i18n, { Messages } from "@common/i18n";
import React from "@common/react";
import { Button, Divider, Flex, Text, Tooltip } from "@components";
import { plugins } from "src/renderer/managers/plugins";
import { themes } from "src/renderer/managers/themes";
import {
  type UpdateSettings,
  checkAllUpdates,
  getAvailableUpdates,
  getMainUpdaterSettings,
  installAllUpdates,
  installUpdate,
} from "src/renderer/managers/updater";
import { sleep } from "src/renderer/util";
import Icons from "../icons";
import { AddonType, label } from "./Addons";
import "./Updater.css";

export const Updater = (): React.ReactElement => {
  const [checking, setChecking] = React.useState(false);
  const [updatesAvailable, setUpdatesAvailable] = React.useState<
    Array<UpdateSettings & { id: string }>
  >(getAvailableUpdates());
  const [updatePromises, setUpdatePromises] = React.useState<Record<string, Promise<boolean>>>({});
  const [didInstallAll, setDidInstallAll] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState(getMainUpdaterSettings().lastChecked);

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
          console.error(err);
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

  const checkForUpdates = async (): Promise<void> => {
    const previousUpdates = getAvailableUpdates();
    setChecking(true);
    await Promise.all([checkAllUpdates(true), sleep(1000)]);
    setChecking(false);
    setLastChecked(getMainUpdaterSettings().lastChecked);
    const newUpdates = getAvailableUpdates();
    setUpdatesAvailable(newUpdates);
    if (newUpdates.length > previousUpdates.length) {
      const count = newUpdates.length - previousUpdates.length;
      toast.toast(Messages.REPLUGGED_UPDATES_TOAST_NEW.format({ count }), toast.Kind.SUCCESS);
    } else {
      toast.toast(Messages.REPLUGGED_UPDATES_TOAST_NO_NEW, toast.Kind.SUCCESS);
    }
  };

  const installAll = async (): Promise<void> => {
    setDidInstallAll(true);
    const promises = installAllUpdates(false, true);
    setUpdatePromises(promises);
    const statuses = await Promise.allSettled(Object.values(promises));
    const didAllSucceed = statuses.every((s) => s.status === "fulfilled" && s.value);
    if (didAllSucceed) {
      toast.toast(Messages.REPLUGGED_UPDATES_TOAST_SUCCESS_ALL, toast.Kind.SUCCESS);
    } else {
      toast.toast(Messages.REPLUGGED_UPDATES_TOAST_FAILED_ALL, toast.Kind.FAILURE);
    }
  };

  const installOne = async (id: string): Promise<void> => {
    setDidInstallAll(false);
    const promise = installUpdate(id, false, true);
    setUpdatePromises((prev) => ({ ...prev, [id]: promise }));
    const status = await promise.catch(() => false);
    if (status) {
      toast.toast(Messages.REPLUGGED_UPDATES_TOAST_SUCCESS_ONE, toast.Kind.SUCCESS);
    } else {
      toast.toast(Messages.REPLUGGED_UPDATES_TOAST_FAILED_ONE, toast.Kind.FAILURE);
    }
  };

  const reload = (): void => {
    window.DiscordNative.app.relaunch();
  };

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2>{Messages.REPLUGGED_UPDATES_UPDATER}</Text.H2>
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      <Flex
        className="replugged-updater-header"
        justify={Flex.Justify.BETWEEN}
        align={Flex.Align.CENTER}>
        <Flex justify={Flex.Justify.CENTER} direction={Flex.Direction.VERTICAL}>
          <Text variant="heading-md/bold" color="header-primary">
            {updatesAvailable.length
              ? Messages.REPLUGGED_UPDATES_AVAILABLE.format({ count: updatesAvailable.length })
              : Messages.REPLUGGED_UPDATES_UP_TO_DATE}
          </Text>
          {lastChecked ? (
            <Text.Normal style={{ marginTop: "5px" }}>
              {Messages.REPLUGGED_UPDATES_LAST_CHECKED.format({
                date: new Date(lastChecked).toLocaleString(i18n.getLocale()),
              })}
            </Text.Normal>
          ) : null}
        </Flex>
        {!hasAnyUpdates ? (
          <Button
            className="replugged-updater-check"
            onClick={checkForUpdates}
            disabled={isAnyUpdating || isAnyComplete}
            color={checking ? Button.Colors.PRIMARY : Button.Colors.BRAND}
            submitting={checking}>
            {Messages.REPLUGGED_UPDATES_CHECK}
          </Button>
        ) : isAllComplete && didInstallAll ? (
          <Button onClick={reload} color={Button.Colors.RED}>
            {Messages.REPLUGGED_UPDATES_AWAITING_RELOAD_TITLE}
          </Button>
        ) : (
          <Button
            onClick={installAll}
            disabled={isAllComplete}
            color={isAllUpdating ? Button.Colors.PRIMARY : Button.Colors.BRAND}
            submitting={isAnyUpdating}>
            {Messages.REPLUGGED_UPDATES_UPDATE_ALL}
          </Button>
        )}
      </Flex>
      <Flex className="replugged-updater-items" direction={Flex.Direction.VERTICAL}>
        {updatesAvailable.map((update) => {
          const addon = plugins.get(update.id) || themes.get(update.id);
          const isUpdating = update.id in updatePromises;
          if (!addon) return null;
          const { manifest } = addon;
          const type = manifest.type === "replugged-plugin" ? AddonType.Plugin : AddonType.Theme;
          const sourceLink = update.webUrl;
          return (
            <>
              <Flex
                className="replugged-updater-item"
                justify={Flex.Justify.BETWEEN}
                align={Flex.Align.CENTER}>
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
                        text={Messages.REPLUGGED_ADDON_PAGE_OPEN.format({
                          type: label(type, { caps: "title" }),
                        })}
                        className="replugged-addon-icon replugged-addon-icon-md">
                        <a href={sourceLink} target="_blank" rel="noopener noreferrer">
                          <Icons.Link />
                        </a>
                      </Tooltip>
                    ) : null}
                  </Flex>
                  <Text.Normal>
                    {Messages.REPLUGGED_UPDATES_UPDATE_TO.format({ version: `v${update.version}` })}
                  </Text.Normal>
                </div>
                {update.available ? (
                  <Button
                    onClick={() => installOne(update.id)}
                    color={Button.Colors.PRIMARY}
                    submitting={isUpdating}>
                    {Messages.REPLUGGED_UPDATES_UPDATE}
                  </Button>
                ) : didInstallAll ? null : (
                  <Button onClick={reload} color={Button.Colors.RED}>
                    {Messages.REPLUGGED_UPDATES_AWAITING_RELOAD_TITLE}
                  </Button>
                )}
              </Flex>
            </>
          );
        })}
      </Flex>
    </>
  );
};
