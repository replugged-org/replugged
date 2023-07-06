import { modal, toast } from "@common";
import React from "@common/react";
import {
  Button,
  ButtonItem,
  Category,
  Divider,
  Flex,
  FormItem,
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

export const General = (): React.ReactElement => {
  const { value: expValue, onChange: expOnChange } = util.useSetting(
    generalSettings,
    "experiments",
  );
  const { value: rdtValue, onChange: rdtOnChange } = util.useSetting(
    generalSettings,
    "reactDevTools",
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
        {...util.useSetting(generalSettings, "autoApplyQuickCss")}
        note={Messages.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC}>
        {Messages.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY}
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
            void modal
              .confirm({
                title: Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS,
                body: Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC.format(),
                confirmText: Messages.REPLUGGED_RELOAD,
                confirmColor: Button.Colors.RED,
              })
              .then((answer) => {
                if (answer) {
                  expOnChange(value);
                  reload();
                }
              });
          }}
          note={Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC.format()}>
          {Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS}
        </SwitchItem>

        <SwitchItem
          value={rdtValue}
          onChange={(value) => {
            void modal
              .confirm({
                title: Messages.REPLUGGED_SETTINGS_REACT_DEVTOOLS,
                body: Messages.REPLUGGED_SETTINGS_REACT_DEVTOOLS_DESC.format(),
                confirmText: Messages.REPLUGGED_RELOAD,
                confirmColor: Button.Colors.RED,
              })
              .then((answer) => {
                if (answer) {
                  if (value) {
                    void RepluggedNative.reactDevTools
                      .downloadExtension()
                      .then(() => {
                        rdtOnChange(value);
                        relaunch();
                      })
                      .catch(
                        void toast.toast(
                          Messages.REPLUGGED_SETTINGS_REACT_DEVTOOLS_FAILED,
                          toast.Kind.FAILURE,
                        ),
                      );
                  } else {
                    relaunch();
                  }
                }
              });
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
