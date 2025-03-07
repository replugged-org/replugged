import { React, i18n, modal, toast } from "@common";
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
  "dev.recelled.Settings",
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
      title: i18n.intl.string(t.RECELLED_SETTINGS_RESTART_TITLE),
      body: i18n.intl.string(t.RECELLED_SETTINGS_RESTART),
      confirmText: i18n.intl.string(t.RECELLED_RESTART),
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
        <Text.H2>{i18n.intl.string(t.RECELLED_GENERAL_SETTINGS)}</Text.H2>
      </Flex>

      <Divider style={{ margin: "20px 0px" }} />

      <SwitchItem
        {...util.useSetting(generalSettings, "badges")}
        note={i18n.intl.string(t.RECELLED_SETTINGS_BADGES_DESC)}>
        {i18n.intl.string(t.RECELLED_SETTINGS_BADGES)}
      </SwitchItem>

      <SwitchItem
        {...util.useSetting(generalSettings, "addonEmbeds")}
        note={i18n.intl.string(t.RECELLED_SETTINGS_ADDON_EMBEDS_DESC)}>
        {i18n.intl.string(t.RECELLED_SETTINGS_ADDON_EMBEDS)}
      </SwitchItem>

      <SwitchItem
        {...util.useSetting(generalSettings, "autoApplyQuickCss")}
        note={i18n.intl.string(t.RECELLED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC)}>
        {i18n.intl.string(t.RECELLED_SETTINGS_QUICKCSS_AUTO_APPLY)}
      </SwitchItem>

      <Category
        title={i18n.intl.string(t.RECELLED_SETTINGS_ADVANCED)}
        note={i18n.intl.string(t.RECELLED_SETTINGS_ADVANCED_DESC)}>
        <FormItem
          title={i18n.intl.string(t.RECELLED_SETTINGS_BACKEND)}
          note={i18n.intl.string(t.RECELLED_SETTINGS_BACKEND_DESC)}
          divider={true}
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
          note={i18n.intl.format(t.RECELLED_SETTINGS_DISCORD_EXPERIMENTS_DESC, {})}>
          {i18n.intl.string(t.RECELLED_SETTINGS_DISCORD_EXPERIMENTS)}
        </SwitchItem>

        <SwitchItem
          value={rdtValue}
          onChange={(value) => {
            if (value) {
              rdtOnChange(value);
              void ReCelledNative.reactDevTools
                .downloadExtension()
                .then(() => {
                  restartModal(true);
                })
                .catch(() => {
                  rdtOnChange(false); // Disable if failed
                  toast.toast(
                    i18n.intl.string(t.RECELLED_SETTINGS_REACT_DEVTOOLS_FAILED),
                    toast.Kind.FAILURE,
                  );
                });
            } else {
              rdtOnChange(value);
              restartModal(true);
            }
          }}
          note={i18n.intl.format(t.RECELLED_SETTINGS_REACT_DEVTOOLS_DESC, {})}>
          {i18n.intl.string(t.RECELLED_SETTINGS_REACT_DEVTOOLS)}
        </SwitchItem>

        <ButtonItem
          button={i18n.intl.string(t.RECELLED_SETTINGS_DEV_COMPANION_RECONNECT)}
          note={i18n.intl.string(t.RECELLED_SETTINGS_DEV_COMPANION_DESC)}
          onClick={() => {
            socket?.close(1000, "Reconnecting");
            initWs(true);
          }}>
          {i18n.intl.string(t.RECELLED_SETTINGS_DEV_COMPANION)}
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
