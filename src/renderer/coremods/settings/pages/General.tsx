import { React, modal, toast } from "@common";
import { t as discordT, intl } from "@common/i18n";
import {
  Button,
  ButtonItem,
  Divider,
  FieldSet,
  Notice,
  Stack,
  Switch,
  TabBar,
  Text,
  TextInput,
} from "@components";
import { WEBSITE_URL } from "src/constants";
import * as QuickCSS from "src/renderer/managers/quick-css";
import { generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import { useSetting, useSettingArray } from "src/renderer/util";
import { initWs, socket } from "../../devCompanion";

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
  const [badges, setBadges] = useSettingArray(generalSettings, "badges");
  const [addonEmbeds, setAddonEmbeds] = useSettingArray(generalSettings, "addonEmbeds");
  const [titleBar, setTitleBar] = useSettingArray(generalSettings, "titleBar");
  const [quickCSS, setQuickCSS] = useSettingArray(generalSettings, "quickCSS");
  const [autoApplyQuickCss, setAutoApplyQuickCssOnChange] = useSettingArray(
    generalSettings,
    "autoApplyQuickCss",
  );

  return (
    <Stack gap={24}>
      <Stack gap={16}>
        <Switch
          checked={badges}
          onChange={setBadges}
          label={intl.string(t.REPLUGGED_SETTINGS_BADGES)}
          description={intl.string(t.REPLUGGED_SETTINGS_BADGES_DESC)}
        />
        <Switch
          checked={addonEmbeds}
          onChange={setAddonEmbeds}
          label={intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS)}
          description={intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS_DESC)}
        />
        {window.DiscordNative.process.platform === "linux" && (
          <Switch
            checked={titleBar}
            onChange={(value) => {
              setTitleBar(value);
              restartModal(true);
            }}
            label={intl.string(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR)}
            description={intl.format(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR_DESC, {})}
          />
        )}
      </Stack>
      <Divider />
      <FieldSet label={intl.string(t.REPLUGGED_QUICKCSS)}>
        <Switch
          checked={quickCSS}
          onChange={(value) => {
            setQuickCSS(value);
            if (value) QuickCSS.load();
            else QuickCSS.unload();
          }}
          label={intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_ENABLE)}
          description={intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_ENABLE_DESC)}
        />
        <Switch
          checked={autoApplyQuickCss}
          onChange={setAutoApplyQuickCssOnChange}
          disabled={!quickCSS}
          label={intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY)}
          description={intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC)}
        />
      </FieldSet>
    </Stack>
  );
}

function AdvancedTab(): React.ReactElement {
  const [experiments, setExperiments] = useSettingArray(generalSettings, "experiments");
  const [staffDevTools, setStaffDevTools] = useSettingArray(generalSettings, "staffDevTools");
  const [reactDevTools, setReactDevTools] = useSettingArray(generalSettings, "reactDevTools");
  const [keepToken, setKeepToken] = useSettingArray(generalSettings, "keepToken");

  return (
    <Stack gap={16}>
      <Notice messageType={Notice.Types.WARNING}>
        {intl.string(t.REPLUGGED_SETTINGS_ADVANCED_DESC)}
      </Notice>
      <TextInput
        {...useSetting(generalSettings, "apiUrl")}
        label={intl.string(t.REPLUGGED_SETTINGS_BACKEND)}
        description={intl.string(t.REPLUGGED_SETTINGS_BACKEND_DESC)}
        placeholder={WEBSITE_URL}
        disabled
      />
      <Switch
        checked={experiments}
        onChange={(value) => {
          setExperiments(value);
          restartModal();
        }}
        label={intl.string(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS)}
        description={intl.format(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC, {})}
      />
      <Switch
        disabled={!experiments}
        checked={staffDevTools}
        onChange={(value) => {
          setStaffDevTools(value);
          restartModal();
        }}
        label={intl.string(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS)}
        description={intl.format(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS_DESC, {})}
      />
      <Switch
        checked={reactDevTools}
        onChange={async (value) => {
          try {
            setReactDevTools(value);
            if (value) {
              await RepluggedNative.reactDevTools.downloadExtension();
            } else {
              await RepluggedNative.reactDevTools.removeExtension();
            }
            restartModal(true);
          } catch {
            // Revert setting on any error
            setReactDevTools(false);
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
        label={intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS)}
        description={intl.format(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS_DESC, {})}
      />
      <Switch
        checked={keepToken}
        onChange={(value) => {
          setKeepToken(value);
          restartModal();
        }}
        label={intl.string(t.REPLUGGED_SETTINGS_KEEP_TOKEN)}
        description={intl.string(t.REPLUGGED_SETTINGS_KEEP_TOKEN_DESC)}
      />
      <ButtonItem
        button={intl.string(discordT.RECONNECT)}
        label={intl.string(t.REPLUGGED_SETTINGS_DEV_COMPANION)}
        description={intl.string(t.REPLUGGED_SETTINGS_DEV_COMPANION_DESC)}
        onClick={() => {
          socket?.close(1000, "Reconnecting");
          initWs(true);
        }}
      />
    </Stack>
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
        <Text.H1
          variant="heading-xxl/semibold"
          className="replugged-general-easter-egg"
          style={{ color: `hsl(${hue}, 100%, 50%)` }}>
          Wake up. Wake up. Wake up.
        </Text.H1>
      )}
    </>
  );
}
