import { React, classNames, marginStyles, modal, toast } from "@common";
import { t as discordT, intl } from "@common/i18n";
import {
  Button,
  ButtonItem,
  Category,
  Divider,
  FormItem,
  Notice,
  SelectItem,
  SwitchItem,
  TabBar,
  Text,
  TextInput,
} from "@components";
import { WEBSITE_URL } from "src/constants";
import { generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import * as util from "src/renderer/util";
import type { BackgroundMaterialType, VibrancyType } from "src/types";
import { initWs, socket } from "../../devCompanion";
import {
  updateBackgroundColor,
  updateBackgroundMaterial,
  updateVibrancy,
} from "../../transparency";

import "./General.css";

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
      confirmText: doRelaunch
        ? intl.string(discordT.BUNDLE_READY_RESTART)
        : intl.string(discordT.ERRORS_RELOAD),
      cancelText: intl.string(discordT.CANCEL),
      confirmColor: Button.Colors.RED,
      onConfirm,
      onCancel,
    })
    .then((answer) => answer && restart());
}

const GeneralSettingsTabs = { GENERAL: "general", ADVANCED: "advanced" } as const;

function GeneralTab(): React.ReactElement {
  const [quickCSSValue, quickCSSOnChange] = util.useSettingArray(generalSettings, "quickCSS");
  const [titleBarValue, titleBarOnChange] = util.useSettingArray(generalSettings, "titleBar");
  const [transValue, transOnChange] = util.useSettingArray(generalSettings, "transparency.enabled");
  const [overrideBgColValue, overrideBgColOnChange] = util.useSettingArray(
    generalSettings,
    "transparency.overrideWindowBackgroundColor",
  );
  const [bgColValue] = util.useSettingArray(generalSettings, "transparency.windowBackgroundColor");
  const [overrideBgMatValue, overrideBgMatOnChange] = util.useSettingArray(
    generalSettings,
    "transparency.overrideWindowBackgroundMaterial",
  );
  const [bgMatValue, bgMatOnChange] = util.useSettingArray(
    generalSettings,
    "transparency.windowBackgroundMaterial",
  );
  const [overrideVibrancyValue, overrideVibrancyOnChange] = util.useSettingArray(
    generalSettings,
    "transparency.overrideWindowVibrancy",
  );
  const [vibrancyValue, vibrancyOnChange] = util.useSettingArray(
    generalSettings,
    "transparency.windowVibrancy",
  );

  React.useEffect(() => {
    if (quickCSSValue) window.replugged.quickCSS.load();
    else window.replugged.quickCSS.unload();
  }, [quickCSSValue]);

  const isLinux = DiscordNative.process.platform === "linux";

  return (
    <>
      <SwitchItem
        {...util.useSetting(generalSettings, "badges")}
        note={intl.string(t.REPLUGGED_SETTINGS_BADGES_DESC)}>
        {intl.string(t.REPLUGGED_SETTINGS_BADGES)}
      </SwitchItem>
      <SwitchItem
        {...util.useSetting(generalSettings, "addonEmbeds")}
        note={intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS_DESC)}
        className={classNames({ [marginStyles.marginBottom40]: !isLinux })}>
        {intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS)}
      </SwitchItem>
      {isLinux && (
        <SwitchItem
          value={titleBarValue}
          onChange={(value) => {
            titleBarOnChange(value);
            restartModal(true);
          }}
          note={intl.format(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR_DESC, {})}
          className={marginStyles.marginBottom40}>
          {intl.string(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR)}
        </SwitchItem>
      )}
      <FormItem title={intl.string(t.REPLUGGED_QUICKCSS)}>
        <SwitchItem
          value={quickCSSValue}
          onChange={quickCSSOnChange}
          note={intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_ENABLE_DESC)}>
          {intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_ENABLE)}
        </SwitchItem>
        <SwitchItem
          {...util.useSetting(generalSettings, "autoApplyQuickCss")}
          disabled={!quickCSSValue}
          note={intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC)}>
          {intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY)}
        </SwitchItem>
      </FormItem>
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
              {/* <ColorPicker
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
              /> */}
            </FormItem>

            <SwitchItem
              value={overrideBgMatValue}
              onChange={(value) => {
                overrideBgMatOnChange(value);
                if (value) {
                  void RepluggedNative.transparency.setBackgroundMaterial(
                    bgMatValue as BackgroundMaterialType,
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
                  value as BackgroundMaterialType,
                );
              }}
              disabled={!overrideBgMatValue || !transValue}
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
                      | "titlebar"
                      | "selection"
                      | "menu"
                      | "popover"
                      | "sidebar"
                      | "header"
                      | "sheet"
                      | "window"
                      | "hud"
                      | "fullscreen-ui"
                      | "tooltip"
                      | "content"
                      | "under-window"
                      | "under-page"
                      | null,
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
                void RepluggedNative.transparency.setVibrancy(value as VibrancyType);
              }}
              disabled={!overrideVibrancyValue || !transValue}
              options={[
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
    </>
  );
}

function AdvancedTab(): React.ReactElement {
  const [expValue, expOnChange] = util.useSettingArray(generalSettings, "experiments");
  const [staffDevToolsValue, staffDevToolsOnChange] = util.useSettingArray(
    generalSettings,
    "staffDevTools",
  );
  const [rdtValue, rdtOnChange] = util.useSettingArray(generalSettings, "reactDevTools");
  const [keepTokenValue, keepTokenOnChange] = util.useSettingArray(generalSettings, "keepToken");

  return (
    <>
      <Notice messageType={Notice.Types.WARNING} className={marginStyles.marginBottom20}>
        {intl.string(t.REPLUGGED_SETTINGS_ADVANCED_DESC)}
      </Notice>
      <div className={marginStyles.marginBottom20}>
        <TextInput
          {...util.useSetting(generalSettings, "apiUrl")}
          label={intl.string(t.REPLUGGED_SETTINGS_BACKEND)}
          description={intl.string(t.REPLUGGED_SETTINGS_BACKEND_DESC)}
          placeholder={WEBSITE_URL}
          disabled
        />
      </div>
      <Divider className={marginStyles.marginBottom20} />
      <SwitchItem
        value={expValue}
        onChange={(value) => {
          expOnChange(value);
          restartModal();
        }}
        note={intl.format(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC, {})}>
        {intl.string(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS)}
      </SwitchItem>
      <SwitchItem
        disabled={!expValue}
        value={staffDevToolsValue}
        onChange={(value) => {
          staffDevToolsOnChange(value);
          restartModal();
        }}
        note={intl.format(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS_DESC, {})}>
        {intl.string(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS)}
      </SwitchItem>
      <SwitchItem
        value={rdtValue}
        onChange={async (value) => {
          try {
            rdtOnChange(value);
            if (value) {
              await RepluggedNative.reactDevTools.downloadExtension();
            } else {
              await RepluggedNative.reactDevTools.removeExtension();
            }
            restartModal(true);
          } catch {
            // Revert setting on any error
            rdtOnChange(false);
            if (value) {
              try {
                await RepluggedNative.reactDevTools.removeExtension();
              } catch {
                // Ignore cleanup errors
              }
            }
            toast.toast(
              intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS_FAILED),
              toast.Kind.FAILURE,
            );
          }
        }}
        note={intl.format(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS_DESC, {})}>
        {intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS)}
      </SwitchItem>
      <SwitchItem
        value={keepTokenValue}
        onChange={(value) => {
          keepTokenOnChange(value);
          restartModal();
        }}
        note={intl.string(t.REPLUGGED_SETTINGS_KEEP_TOKEN_DESC)}>
        {intl.string(t.REPLUGGED_SETTINGS_KEEP_TOKEN)}
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
    </>
  );
}

export function General(): React.ReactElement {
  const [selectedTab, setSelectedTab] = React.useState<string>(GeneralSettingsTabs.GENERAL);

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

  const listener = React.useCallback(
    (e: KeyboardEvent): void => {
      if (isEasterEgg) return;
      setKKeys((val) => [...val.slice(-1 * (konamiCode.length - 1)), e.code]);
    },
    [isEasterEgg],
  );

  React.useEffect(() => {
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [kKeys, isEasterEgg, listener]);

  return (
    <>
      <TabBar selectedItem={selectedTab} type="top" look="brand" onItemSelect={setSelectedTab}>
        <TabBar.Item id={GeneralSettingsTabs.GENERAL}>
          {intl.string(discordT.SETTINGS_GENERAL)}
        </TabBar.Item>
        <TabBar.Item id={GeneralSettingsTabs.ADVANCED}>
          {intl.string(discordT.SETTINGS_ADVANCED)}
        </TabBar.Item>
      </TabBar>
      <TabBar.Panel id={selectedTab} className="replugged-general-tabBarPanel">
        {selectedTab === GeneralSettingsTabs.GENERAL && <GeneralTab />}
        {selectedTab === GeneralSettingsTabs.ADVANCED && <AdvancedTab />}
      </TabBar.Panel>
      {isEasterEgg && (
        <>
          <Text.H1
            variant="heading-xxl/semibold"
            className="replugged-general-easter-egg"
            style={{ color: `hsl(${hue}, 100%, 50%)` }}>
            Wake up. Wake up. Wake up.
          </Text.H1>
        </>
      )}
    </>
  );
}
