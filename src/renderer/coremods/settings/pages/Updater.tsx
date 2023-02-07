import { toast } from "@common";
import { Messages } from "@common/i18n";
import React from "@common/react";
import { Button, Divider, Flex, Loader, Text } from "@components";
import { plugins } from "src/renderer/managers/plugins";
import { themes } from "src/renderer/managers/themes";
import {
  type UpdateSettings,
  checkAllUpdates,
  getAvailableUpdates,
} from "src/renderer/managers/updater";
import { sleep } from "src/renderer/util";
import "./Updater.css";

export const Updater = (): React.ReactElement => {
  const [checking, setChecking] = React.useState(false);
  const [updatesAvailable, setUpdatesAvailable] = React.useState<
    Array<UpdateSettings & { id: string }>
  >(getAvailableUpdates());

  const checkForUpdates = async (): Promise<void> => {
    const previousUpdates = getAvailableUpdates();
    setChecking(true);
    await Promise.all([checkAllUpdates, sleep(1000)]);
    setChecking(false);
    const newUpdates = getAvailableUpdates();
    setUpdatesAvailable(newUpdates);
    if (newUpdates.length > previousUpdates.length) {
      toast.toast("New updates available!", toast.Kind.SUCCESS);
    } else {
      toast.toast("No new updates available.", toast.Kind.MESSAGE);
    }
  };

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2>{Messages.REPLUGGED_UPDATES_UPDATER}</Text.H2>
        <div style={{ display: "flex" }}>
          <Button
            className="replugged-updater-check"
            onClick={checkForUpdates}
            disabled={checking}
            color={checking ? Button.Colors.PRIMARY : Button.Colors.BRAND}>
            {checking ? (
              <Loader type={Loader.Type.PULSING_ELLIPSIS} />
            ) : (
              Messages.REPLUGGED_UPDATES_CHECK
            )}
          </Button>
        </div>
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      <Flex
        className="replugged-updater-header"
        justify={Flex.Justify.BETWEEN}
        align={Flex.Align.CENTER}>
        <Text variant="heading-md/bold">
          {updatesAvailable.length
            ? Messages.REPLUGGED_UPDATES_AVAILABLE.format({ count: updatesAvailable.length })
            : Messages.REPLUGGED_UPDATES_UP_TO_DATE}
        </Text>
        <Button
          onClick={() => {
            /* todo */
          }}>
          {Messages.REPLUGGED_UPDATES_UPDATE_ALL}
        </Button>
      </Flex>
      <Flex className="replugged-updater-items" direction={Flex.Direction.VERTICAL}>
        {updatesAvailable.map((update) => {
          const addon = plugins.get(update.id) || themes.get(update.id);
          if (!addon) return null;
          const { manifest } = addon;
          return (
            <>
              <Flex
                className="replugged-updater-item"
                justify={Flex.Justify.BETWEEN}
                align={Flex.Align.CENTER}>
                <div>
                  <Text variant="heading-sm/normal" tag="h2" color="header-secondary">
                    <Text variant="heading-lg/bold" tag="span">
                      {manifest.name}
                    </Text>{" "}
                    v{manifest.version}
                  </Text>
                  <Text.Normal>
                    {Messages.REPLUGGED_UPDATES_UPDATE_TO.format({ version: `v${update.version}` })}
                  </Text.Normal>
                </div>
                <Button
                  onClick={() => {
                    /* todo */
                  }}
                  color={Button.Colors.PRIMARY}>
                  {Messages.REPLUGGED_UPDATES_UPDATE}
                </Button>
              </Flex>
            </>
          );
        })}
      </Flex>
    </>
  );
};
