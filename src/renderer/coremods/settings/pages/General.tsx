import { modal, toast } from "@common";
import React from "@common/react";
import {
  Button,
  ButtonItem,
  Category,
  Divider,
  Flex,
  FormItem,
  Notice,
  SwitchItem,
  Text,
  TextInput,
} from "@components";
import * as settings from "../../../apis/settings";
import * as util from "../../../util";
import { Messages } from "@common/i18n";
import { type GeneralSettings, defaultSettings } from "src/types";
import { initWs, socket } from "../../devCompanion";

export const generalSettings = await settings.init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

const konamiCode = ["38", "38", "40", "40", "37", "39", "37", "39", "66", "65"];

function reload(): void {
  setTimeout(() => window.location.reload(), 250);
}

function relaunch(): void {
  setTimeout(() => window.DiscordNative.app.relaunch(), 250);
}

function restartModal(doRelaunch = false, onConfirm?: () => void, onCancel?: () => void): void {
  const restart = doRelaunch ? relaunch : reload;
  void modal
    .confirm({
      title: Messages.REPLUGGED_SETTINGS_RESTART_TITLE,
      body: Messages.REPLUGGED_SETTINGS_RESTART,
      confirmText: Messages.REPLUGGED_RESTART,
      confirmColor: Button.Colors.RED,
      onConfirm,
      onCancel,
    })
    .then((answer) => answer && restart());
}

export const General = (): React.ReactElement => {
  const { value: expValue, onChange: expOnChange } = util.useSetting(
    generalSettings,
    "experiments",
  );
  const { value: rdtValue, onChange: rdtOnChange } = util.useSetting(
    generalSettings,
    "reactDevTools",
  );
  const { value: transValue, onChange: transOnChange } = util.useSetting(
    generalSettings,
    "transparentWindow",
  );

  const [kKeys, setKKeys] = React.useState<number[]>([]);

  const isEasterEgg = kKeys.toString().includes(konamiCode.join(","));

  const [hue, setHue] = React.useState(0);

  React.useEffect(() => {
    if (!isEasterEgg) return;

    const id = requestAnimationFrame(() => {
      setHue((hue + 1) % 360);
    });
    return () => cancelAnimationFrame(id);
  }, [hue, isEasterEgg]);

  const listener = (e: KeyboardEvent): void => {
    if (isEasterEgg) return;
    setKKeys((val) => [...val.slice(-1 * (konamiCode.length - 1)), e.keyCode]);
  };

  React.useEffect(() => {
    document.addEventListener("keydown", listener);

    return () => document.removeEventListener("keydown", listener);
  }, [kKeys, isEasterEgg]);

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2>{Messages.REPLUGGED_GENERAL_SETTINGS}</Text.H2>
      </Flex>

      <Divider style={{ margin: "20px 0px" }} />

      {/* <SwitchItem
        {...util.useSetting(generalSettings, "pluginEmbeds", false)}
        note="Enable embedding plugins in chat">
        Plugin Embeds
      </SwitchItem> */}

      <SwitchItem
        {...util.useSetting(generalSettings, "badges")}
        note={Messages.REPLUGGED_SETTINGS_BADGES_DESC}>
        {Messages.REPLUGGED_SETTINGS_BADGES}
      </SwitchItem>

      <SwitchItem
        {...util.useSetting(generalSettings, "addonEmbeds")}
        note={Messages.REPLUGGED_SETTINGS_ADDON_EMBEDS_DESC}>
        {Messages.REPLUGGED_SETTINGS_ADDON_EMBEDS}
      </SwitchItem>

      <SwitchItem
        {...util.useSetting(generalSettings, "autoApplyQuickCss")}
        note={Messages.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC}>
        {Messages.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY}
      </SwitchItem>

      <div style={{ marginBottom: "15px" }}>
        {(DiscordNative.process.platform === "linux" ||
          DiscordNative.process.platform === "win32") && (
          <Notice messageType={Notice.Types.WARNING} className="">
            {DiscordNative.process.platform === "linux"
              ? Messages.REPLUGGED_SETTINGS_TRANSPARENT_ISSUES_LINUX.format()
              : Messages.REPLUGGED_SETTINGS_TRANSPARENT_ISSUES_WINDOWS.format()}
          </Notice>
        )}
      </div>
      <SwitchItem
        value={transValue}
        onChange={(value) => {
          transOnChange(value);
          restartModal(true);
        }}
        note={Messages.REPLUGGED_SETTINGS_TRANSPARENT_DESC.format()}>
        {Messages.REPLUGGED_SETTINGS_TRANSPARENT}
      </SwitchItem>

      <Category
        title={Messages.REPLUGGED_SETTINGS_ADVANCED}
        note={Messages.REPLUGGED_SETTINGS_ADVANCED_DESC}>
        <FormItem
          title={Messages.REPLUGGED_SETTINGS_BACKEND}
          note={Messages.REPLUGGED_SETTINGS_BACKEND_DESC}
          divider={true}
          style={{ marginBottom: "20px" }}>
          <TextInput
            {...util.useSetting(generalSettings, "apiUrl")}
            placeholder="https://replugged.dev"
          />
        </FormItem>

        <SwitchItem
          value={expValue}
          onChange={(value) => {
            expOnChange(value);
            restartModal(false);
          }}
          note={Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC.format()}>
          {Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS}
        </SwitchItem>

        <SwitchItem
          value={rdtValue}
          onChange={(value) => {
            if (value) {
              rdtOnChange(value);
              void RepluggedNative.reactDevTools
                .downloadExtension()
                .then(() => {
                  restartModal(true);
                })
                .catch(() => {
                  rdtOnChange(false); // Disable if failed
                  toast.toast(
                    Messages.REPLUGGED_SETTINGS_REACT_DEVTOOLS_FAILED,
                    toast.Kind.FAILURE,
                  );
                });
            } else {
              rdtOnChange(value);
              restartModal(true);
            }
          }}
          note={Messages.REPLUGGED_SETTINGS_REACT_DEVTOOLS_DESC.format()}>
          {Messages.REPLUGGED_SETTINGS_REACT_DEVTOOLS}
        </SwitchItem>

        <ButtonItem
          button={Messages.REPLUGGED_SETTINGS_DEV_COMPANION_RECONNECT}
          note={Messages.REPLUGGED_SETTINGS_DEV_COMPANION_DESC}
          onClick={() => {
            socket?.close(1000, "Reconnecting");
            initWs(true);
          }}>
          {Messages.REPLUGGED_SETTINGS_DEV_COMPANION}
        </ButtonItem>
      </Category>

      {/* Sleeping? Wake up. */}
      {isEasterEgg && (
        <>
          <Text.H1
            variant="heading-xxl/semibold"
            style={{ display: "inherit", textAlign: "center", color: `hsl(${hue}, 100%, 50%)` }}>
            Wake up. Wake up. Wake up.
          </Text.H1>
        </>
      )}
    </>
  );
};
