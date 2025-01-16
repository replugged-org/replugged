import { modal, toast } from "@common";
import { intl } from "@common/i18n";
import React from "@common/react";
import {
  Button,
  ButtonItem,
  Category,
  Divider,
  Flex,
  FormItem,
  Notice,
  SelectItem,
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
import ColorPicker from "@components/ColorPicker";
import ColorPickerCustomButton from "@components/ColorPickerCustomButton";
import ColorPickerDefaultButton from "@components/ColorPickerDefaultButton";
import {
  updateBackgroundColor,
  updateBackgroundMaterial,
  updateVibrancy,
} from "../../transparency";

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
      title: intl.string(t.REPLUGGED_SETTINGS_RESTART_TITLE),
      body: intl.string(t.REPLUGGED_SETTINGS_RESTART),
      confirmText: intl.string(t.REPLUGGED_RESTART),
      confirmColor: Button.Colors.RED,
      onConfirm,
      onCancel,
    })
    .then((answer) => answer && restart());
}

export const General = (): React.ReactElement => {
  const [expValue, expOnChange] = util.useSettingArray(generalSettings, "experiments");
  const [rdtValue, rdtOnChange] = util.useSettingArray(generalSettings, "reactDevTools");
  const [transValue, transOnChange] = util.useSettingArray(generalSettings, "transparentWindow");
  const [overrideBgColValue, overrideBgColOnChange] = util.useSettingArray(
    generalSettings,
    "overrideWindowBackgroundColor",
  );
  const [bgColValue, bgColOnChange] = util.useSettingArray(
    generalSettings,
    "windowBackgroundColor",
  );
  const [overrideBgMatValue, overrideBgMatOnChange] = util.useSettingArray(
    generalSettings,
    "overrideWindowBackgroundMaterial",
  );
  const [bgMatValue, bgMatOnChange] = util.useSettingArray(
    generalSettings,
    "windowBackgroundMaterial",
  );
  const [overrideVibrancyValue, overrideVibrancyOnChange] = util.useSettingArray(
    generalSettings,
    "overrideWindowVibrancy",
  );
  const [vibrancyValue, vibrancyOnChange] = util.useSettingArray(generalSettings, "windowVibrancy");

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

      <Category
        // title={intl.string(t.REPLUGGED_SETTINGS_TRANSPARENCY)}
        title="Transparency"
        // note={intl.string(t.REPLUGGED_SETTINGS_TRANSPARENT_CATEGORY_DESC)}>
        note="Window transparency settings">
        <div style={{ marginBottom: "15px" }}>
          {(DiscordNative.process.platform === "linux" ||
            DiscordNative.process.platform === "win32") && (
            <Notice messageType={Notice.Types.WARNING} className="">
              {DiscordNative.process.platform === "linux"
                ? intl.format(t.REPLUGGED_SETTINGS_TRANSPARENT_ISSUES_LINUX, {})
                : intl.format(t.REPLUGGED_SETTINGS_TRANSPARENT_ISSUES_WINDOWS, {})}
            </Notice>
          )}
        </div>
        <SwitchItem
          value={transValue}
          onChange={(value) => {
            transOnChange(value);
            restartModal(true);
          }}
          note={intl.format(t.REPLUGGED_SETTINGS_TRANSPARENT_DESC, {})}>
          {intl.string(t.REPLUGGED_SETTINGS_TRANSPARENT)}
        </SwitchItem>

        {DiscordNative.process.platform === "win32" && (
          <>
            <SwitchItem
              value={overrideBgColValue}
              onChange={(value) => {
                overrideBgColOnChange(value);

                if (value) {
                  void RepluggedNative.transparency.setBackgroundColor(bgColValue);
                } else {
                  void updateBackgroundColor();
                }
              }}
              disabled={!transValue}>
              {/* {intl.string(t.REPLUGGED_SETTINGS_OVERRIDE_BG_COLOR)} */}
              Override Window Background Color
            </SwitchItem>
            <FormItem title="Background Color" divider={true} style={{ marginBottom: "20px" }}>
              <ColorPicker
                defaultColor={10070709}
                colors={[
                  0x1abc9c00, 0x2ecc7100, 0x3498db00, 0x9b59b600, 0xe91e6300, 0xf1c40f00,
                  0xe67e2200, 0xe74c3c00, 0x95a5a600, 0x607d8b00, 0x11806a00, 0x1f8b4c00,
                  0x20669400, 0x71368a00, 0xad145700, 0xc27c0e00, 0xa8430000, 0x992d2200,
                  0x979c9f00, 0x546e7a00,
                ]}
                value={Number.parseInt(bgColValue.slice(1), 16)}
                onChange={(value) => {
                  const newValue = `#${value.toString(16).padStart(6, "0").padEnd(8, "0")}`;
                  bgColOnChange(newValue);
                  void RepluggedNative.transparency.setBackgroundColor(newValue);
                }}
                disabled={!generalSettings.get("overrideWindowBackgroundColor") || !transValue}
                customPickerPosition="right"
                renderCustomButton={React.useCallback((props: object) => {
                  const button = <ColorPickerCustomButton {...props} />;
                  // return disabled ? button :
                  return button;
                }, [])}
                renderDefaultButton={React.useCallback(
                  (props: object) => (
                    // <
                    <ColorPickerDefaultButton {...props} aria-label="Custom Color" />
                  ),
                  [],
                )}
              />
            </FormItem>

            <SwitchItem
              value={overrideBgMatValue}
              onChange={(value) => {
                overrideBgMatOnChange(value);
                if (value) {
                  void RepluggedNative.transparency.setBackgroundMaterial(
                    bgMatValue as "none" | "acrylic" | "mica" | "tabbed",
                  );
                } else {
                  // If this line is uncommented, coremods kinda die
                  void updateBackgroundMaterial();
                }
              }}
              disabled={!transValue}>
              {/* {intl.string(t.REPLUGGED_SETTINGS_OVERRIDE_BG_MATERIAL)} */}
              Override Window Background Material
            </SwitchItem>
            <SelectItem
              value={bgMatValue}
              onChange={(value) => {
                bgMatOnChange(value);
                void RepluggedNative.transparency.setBackgroundMaterial(
                  value as "none" | "acrylic" | "mica" | "tabbed",
                );
              }}
              disabled={!generalSettings.get("overrideWindowBackgroundMaterial") || !transValue}
              options={[
                {
                  label: "None",
                  value: "none",
                },
                {
                  label: "Acrylic",
                  value: "acrylic",
                },
                {
                  label: "Mica",
                  value: "mica",
                },
                {
                  label: "Tabbed",
                  value: "tabbed",
                },
              ]}>
              Background Material
            </SelectItem>
          </>
        )}

        {DiscordNative.process.platform === "darwin" && (
          <>
            {/* @todo: This should trigger the SelectItem's onChange with it's current value to apply the overridden material */}
            <SwitchItem
              value={overrideVibrancyValue}
              onChange={(value) => {
                overrideVibrancyOnChange(overrideVibrancyValue);
                if (value) {
                  void RepluggedNative.transparency.setVibrancy(
                    vibrancyValue as
                      | "appearance-based"
                      | "light"
                      | "dark"
                      | "titlebar"
                      | "selection"
                      | "menu"
                      | "popover"
                      | "sidebar"
                      | "medium-light"
                      | "ultra-dark"
                      | "header"
                      | "sheet"
                      | "window"
                      | "hud"
                      | "fullscreen-ui"
                      | "tooltip"
                      | "content"
                      | "under-window"
                      | "under-page",
                  );
                } else {
                  void updateVibrancy();
                }
              }}
              disabled={!transValue}>
              {/* {intl.string(t.REPLUGGED_SETTINGS_OVERRIDE_VIBRANCY)} */}
              Override Window Vibrancy
            </SwitchItem>
            <SelectItem
              value={vibrancyValue}
              onChange={(value) => {
                vibrancyOnChange(value);
                void RepluggedNative.transparency.setVibrancy(
                  value as
                    | "appearance-based"
                    | "light"
                    | "dark"
                    | "titlebar"
                    | "selection"
                    | "menu"
                    | "popover"
                    | "sidebar"
                    | "medium-light"
                    | "ultra-dark"
                    | "header"
                    | "sheet"
                    | "window"
                    | "hud"
                    | "fullscreen-ui"
                    | "tooltip"
                    | "content"
                    | "under-window"
                    | "under-page",
                );
              }}
              disabled={!generalSettings.get("overrideWindowVibrancy") || !transValue}
              options={[
                {
                  label: "Appearance-based",
                  value: "appearance-based",
                },
                {
                  label: "Light",
                  value: "light",
                },
                {
                  label: "Dark",
                  value: "dark",
                },
                {
                  label: "Titlebar",
                  value: "titlebar",
                },
                {
                  label: "Selection",
                  value: "selection",
                },
                {
                  label: "Menu",
                  value: "menu",
                },
                {
                  label: "Popover",
                  value: "popover",
                },
                {
                  label: "Sidebar",
                  value: "sidebar",
                },
                {
                  label: "Medium Light",
                  value: "medium-light",
                },
                {
                  label: "Ultra Dark",
                  value: "ultra-dark",
                },
                {
                  label: "Header",
                  value: "header",
                },
                {
                  label: "Sheet",
                  value: "sheet",
                },
                {
                  label: "Window",
                  value: "window",
                },
                {
                  label: "HUD",
                  value: "hud",
                },
                {
                  label: "Fullscreen UI",
                  value: "fullscreen-ui",
                },
                {
                  label: "Tooltip",
                  value: "tooltip",
                },
                {
                  label: "Content",
                  value: "content",
                },
                {
                  label: "Under Window",
                  value: "under-window",
                },
                {
                  label: "Under Page",
                  value: "under-page",
                },
              ]}>
              Vibrancy
            </SelectItem>
          </>
        )}
      </Category>

      <Category
        title={intl.string(t.REPLUGGED_SETTINGS_ADVANCED)}
        note={intl.string(t.REPLUGGED_SETTINGS_ADVANCED_DESC)}>
        <FormItem
          title={intl.string(t.REPLUGGED_SETTINGS_BACKEND)}
          note={intl.string(t.REPLUGGED_SETTINGS_BACKEND_DESC)}
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
          note={intl.format(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC, {})}>
          {intl.string(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS)}
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
          button={intl.string(t.REPLUGGED_SETTINGS_DEV_COMPANION_RECONNECT)}
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
