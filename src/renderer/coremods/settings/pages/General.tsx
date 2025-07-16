import { modal, toast } from "@common";
import { t as discordT, intl } from "@common/i18n";
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
import { WEBSITE_URL } from "src/constants";
import { t } from "src/renderer/modules/i18n";
import { type GeneralSettings, defaultSettings } from "src/types";
import * as settings from "../../../apis/settings";
import * as util from "../../../util";
import { initWs, socket } from "../../devCompanion";

export const generalSettings = settings.init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

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
      title: intl.string(t.REPLUGGED_SETTINGS_RESTART_TITLE),
      body: intl.string(t.REPLUGGED_SETTINGS_RESTART),
      confirmText: intl.string(discordT.BUNDLE_READY_RESTART),
      confirmColor: Button.Colors.RED,
      onConfirm,
      onCancel,
    })
    .then((answer) => answer && restart());
}

export const General = (): React.ReactElement => {
  const [expValue, expOnChange] = util.useSettingArray(generalSettings, "experiments");
  const [rdtValue, rdtOnChange] = util.useSettingArray(generalSettings, "reactDevTools");
  const [titleBarValue, titleBarOnChange] = util.useSettingArray(generalSettings, "titleBar");
  const [staffDevToolsValue, staffDevToolsOnChange] = util.useSettingArray(
    generalSettings,
    "staffDevTools",
  );

  const [kKeys, setKKeys] = React.useState<string[]>([]);
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
    setKKeys((val) => [...val.slice(-1 * (konamiCode.length - 1)), e.code]);
  };

  React.useEffect(() => {
    document.addEventListener("keydown", listener);

    return () => document.removeEventListener("keydown", listener);
  }, [kKeys, isEasterEgg]);

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2>{intl.string(t.REPLUGGED_GENERAL_SETTINGS)}</Text.H2>
      </Flex>

      <Divider style={{ margin: "20px 0px" }} />

      <SwitchItem
        {...util.useSetting(generalSettings, "badges")}
        note={intl.string(t.REPLUGGED_SETTINGS_BADGES_DESC)}>
        {intl.string(t.REPLUGGED_SETTINGS_BADGES)}
      </SwitchItem>

      <SwitchItem
        {...util.useSetting(generalSettings, "addonEmbeds")}
        note={intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS_DESC)}>
        {intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS)}
      </SwitchItem>

      <SwitchItem
        {...util.useSetting(generalSettings, "autoApplyQuickCss")}
        note={intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC)}>
        {intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY)}
      </SwitchItem>

      {DiscordNative.process.platform === "linux" && (
        <SwitchItem
          value={titleBarValue}
          onChange={(value) => {
            titleBarOnChange(value);
            restartModal(true);
          }}
          note={intl.format(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR_DESC, {})}>
          {intl.string(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR)}
        </SwitchItem>
      )}

      <Category
        title={intl.string(discordT.ADVANCED_SETTINGS)}
        note={intl.string(t.REPLUGGED_SETTINGS_ADVANCED_DESC)}>
        <FormItem
          title={intl.string(t.REPLUGGED_SETTINGS_BACKEND)}
          note={intl.string(t.REPLUGGED_SETTINGS_BACKEND_DESC)}
          divider
          style={{ marginBottom: "20px" }}>
          <TextInput
            {...util.useSetting(generalSettings, "apiUrl")}
            placeholder={WEBSITE_URL}
            disabled
          />
        </FormItem>

        <SwitchItem
          value={expValue}
          onChange={(value) => {
            expOnChange(value);
            restartModal(false);
          }}
          note={intl.format(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC, {})}>
          {intl.string(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS)}
        </SwitchItem>

        <SwitchItem
          disabled={!expValue}
          value={staffDevToolsValue}
          onChange={(value) => {
            staffDevToolsOnChange(value);
            restartModal(false);
          }}
          note={intl.format(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS_DESC, {})}>
          {intl.string(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS)}
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
                    intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS_FAILED),
                    toast.Kind.FAILURE,
                  );
                });
            } else {
              rdtOnChange(value);
              restartModal(true);
            }
          }}
          note={intl.format(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS_DESC, {})}>
          {intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS)}
        </SwitchItem>

        <ButtonItem
          button={intl.string(discordT.RECONNECT)}
          note={intl.string(t.REPLUGGED_SETTINGS_DEV_COMPANION_DESC)}
          onClick={() => {
            socket?.close(1000, "Reconnecting");
            initWs(true);
          }}>
          {intl.string(t.REPLUGGED_SETTINGS_DEV_COMPANION)}
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
