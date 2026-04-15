import { t as discordT, intl } from "@common/i18n";
import modal from "@common/modal";
import { ToastType, toast } from "@common/toast";
import { Notice, TextInput } from "@components";
import { WEBSITE_URL } from "src/constants";
import * as QuickCSS from "src/renderer/managers/quick-css";
import { type GeneralSettings, generalSettings } from "src/renderer/managers/settings";
import { t } from "src/renderer/modules/i18n";
import {
  BACKGROUND_MATERIALS,
  type BackgroundMaterialType,
  CategoryInlineNoticeType,
  VIBRANCY_SELECT_OPTIONS,
  type VibrancyType,
} from "src/types";
import { RepluggedIcon } from "../icons";
import {
  createAccordion,
  createCategory,
  createCustom,
  createPanel,
  createSelect,
  createSidebarItem,
  createToggle,
} from "../lib";

function bindSetting<
  K extends Extract<keyof GeneralSettings, string>,
  V extends NonNullable<GeneralSettings[K]>,
>(key: K): { useValue: () => V; setValue: (value: V) => void } {
  return {
    useValue: () => generalSettings.useValue(key) as V,
    setValue: (value: V) => generalSettings.set(key, value),
  };
}

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
      onConfirm,
      onCancel,
    })
    .then((answer) => answer && restart());
}

const BadgesSetting = createToggle("general_badges_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_BADGES),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_BADGES_DESC),
  ...bindSetting("badges"),
});

const AddonEmbedsSetting = createToggle("general_addon_embeds_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS_DESC),
  ...bindSetting("addonEmbeds"),
});

const AppearanceCategory = createCategory("general_appearance_category", {
  useTitle: () => intl.string(discordT.APPEARANCE),
  buildLayout: () => [BadgesSetting, AddonEmbedsSetting],
});

const QuickCSSSetting = createToggle("general_quickcss_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_ENABLE),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_ENABLE_DESC),
  ...bindSetting("quickCSS"),
  setValue: (value) => {
    generalSettings.set("quickCSS", value);
    if (value) QuickCSS.load();
    else QuickCSS.unload();
  },
});

const QuickCSSAutoApplySetting = createToggle("general_auto_apply_quickcss_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC),
  ...bindSetting("autoApplyQuickCss"),
  useDisabled: () => !generalSettings.useValue("quickCSS"),
});

const QuickCSSCategory = createCategory("general_quickcss_category", {
  useTitle: () => intl.string(t.REPLUGGED_QUICKCSS),
  buildLayout: () => [QuickCSSSetting, QuickCSSAutoApplySetting],
});

const DisableMinSizeSetting = createToggle("general_disable_min_size_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_DISABLE_MIN_SIZE),
  useSubtitle: () => intl.format(t.REPLUGGED_SETTINGS_DISABLE_MIN_SIZE_DESC, {}),
  ...bindSetting("disableMinimumSize"),
  setValue: (value) => {
    generalSettings.set("disableMinimumSize", value);
    restartModal(true);
  },
});

const CustomTitleBarSetting = createToggle("general_custom_title_bar_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR),
  useSubtitle: () => intl.format(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR_DESC, {}),
  ...bindSetting("titleBar"),
  setValue: (value) => {
    generalSettings.set("titleBar", value);
    restartModal(true);
  },
});

const TransparencySetting = createToggle("general_transparency_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_TRANSPARENT),
  useSubtitle: () => intl.format(t.REPLUGGED_SETTINGS_TRANSPARENT_DESC, {}),
  ...bindSetting("transparency"),
  setValue: (value) => {
    generalSettings.set("transparency", value);
    restartModal(true);
  },
});

const TransparencyNotice = createCustom("general_transparency_warning", {
  usePredicate: () => ["linux", "win32"].includes(window.DiscordNative.process.platform),
  Component: () => (
    <Notice messageType={Notice.Types.WARNING}>
      {window.DiscordNative.process.platform === "linux"
        ? intl.format(t.REPLUGGED_SETTINGS_TRANSPARENT_ISSUES_LINUX, {})
        : intl.format(t.REPLUGGED_SETTINGS_TRANSPARENT_ISSUES_WINDOWS, {})}
    </Notice>
  ),
});

const BackgroundMaterialSetting = createSelect("general_background_material_setting", {
  usePredicate: () => window.DiscordNative.process.platform === "win32",
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_TRANSPARENCY_BG_MATERIAL),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_TRANSPARENCY_BG_MATERIAL_DESC),
  ...bindSetting("backgroundMaterial"),
  useOptions: () =>
    BACKGROUND_MATERIALS.map((m) => ({
      label: m.charAt(0).toUpperCase() + m.slice(1),
      value: m,
      id: m,
    })),
  setValue: (value) => {
    generalSettings.set("backgroundMaterial", value as BackgroundMaterialType);
    void window.RepluggedNative.transparency.setBackgroundMaterial(value as BackgroundMaterialType);
  },
});

const VibrancySetting = createSelect("general_vibrancy_setting", {
  usePredicate: () => window.DiscordNative.process.platform === "darwin",
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_TRANSPARENCY_VIBRANCY),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_TRANSPARENCY_VIBRANCY_DESC),
  ...bindSetting("vibrancy"),
  clearable: true,
  useOptions: () =>
    VIBRANCY_SELECT_OPTIONS.map((v) => ({ label: v.label, value: v.value, id: v.value })),
  setValue: (value) => {
    generalSettings.set("vibrancy", value as VibrancyType);
    void window.RepluggedNative.transparency.setVibrancy(value as VibrancyType);
  },
});

const WindowCategory = createCategory("general_window_category", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_WINDOW),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_WINDOW_DESC),
  buildLayout: () => [
    DisableMinSizeSetting,
    CustomTitleBarSetting,
    TransparencySetting,
    TransparencyNotice,
    BackgroundMaterialSetting,
    VibrancySetting,
  ],
});

const ExperimentsSetting = createToggle("general_experiments_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS),
  useSubtitle: () => intl.format(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC, {}),
  ...bindSetting("experiments"),
  setValue: (value) => {
    generalSettings.set("experiments", value);
    restartModal();
  },
});

const ExperimentsWarning = createCustom("general_experiments_warning", {
  Component: () => (
    <Notice messageType={Notice.Types.WARNING}>
      {intl.format(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_WARNING, {})}
    </Notice>
  ),
});

const StaffDevToolsSetting = createToggle("general_staff_dev_tools", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS),
  useSubtitle: () => intl.format(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS_DESC, {}),
  ...bindSetting("staffDevTools"),
  useDisabled: () => !generalSettings.useValue("experiments"),
  setValue: (value) => {
    generalSettings.set("staffDevTools", value);
    restartModal();
  },
});

const ReactDevToolsSetting = createToggle("general_react_dev_tools_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS),
  useSubtitle: () => intl.format(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS_DESC, {}),
  ...bindSetting("reactDevTools"),
  setValue: async (value) => {
    try {
      generalSettings.set("reactDevTools", value);
      if (value) {
        await window.RepluggedNative.reactDevTools.downloadExtension();
      } else {
        await window.RepluggedNative.reactDevTools.removeExtension();
      }
      restartModal(true);
    } catch {
      // Revert setting on any error
      generalSettings.set("reactDevTools", false);
      if (value) {
        try {
          await window.RepluggedNative.reactDevTools.removeExtension();
        } catch {
          // Ignore cleanup errors
        }
      }
      toast(intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS_FAILED), ToastType.FAILURE);
    }
  },
});

const KeepTokenSetting = createToggle("general_keep_token_setting", {
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_KEEP_TOKEN),
  useSubtitle: () => intl.format(t.REPLUGGED_SETTINGS_KEEP_TOKEN_DESC, {}),
  ...bindSetting("keepToken"),
  setValue: (value) => {
    generalSettings.set("keepToken", value);
    restartModal();
  },
});

const WinUpdaterSetting = createToggle("general_win_updater_setting", {
  usePredicate: () => window.DiscordNative.process.platform === "win32",
  useTitle: () => intl.string(t.REPLUGGED_SETTINGS_WIN_UPDATER),
  useSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_WIN_UPDATER_DESC),
  ...bindSetting("winUpdater"),
});

const ApiUrlSetting = createCustom("general_api_url_setting", {
  useSearchTerms: () => [intl.string(t.REPLUGGED_SETTINGS_BACKEND)],
  Component: () => {
    const value = generalSettings.useValue("apiUrl");
    return (
      <TextInput
        value={value}
        label={intl.string(t.REPLUGGED_SETTINGS_BACKEND)}
        description={intl.string(t.REPLUGGED_SETTINGS_BACKEND_DESC)}
        placeholder={WEBSITE_URL}
        disabled
      />
    );
  },
});

const AdvancedAccordion = createAccordion("general_advanced_accordion", {
  useTitle: (state) =>
    state
      ? intl.string(t.REPLUGGED_SETTINGS_ADVANCED_EXPANDED)
      : intl.string(t.REPLUGGED_SETTINGS_ADVANCED_COLLAPSED),
  useCollapsedSubtitle: () => intl.string(t.REPLUGGED_SETTINGS_ADVANCED_DESC),
  buildLayout: () => [
    ExperimentsSetting,
    ExperimentsWarning,
    StaffDevToolsSetting,
    ReactDevToolsSetting,
    KeepTokenSetting,
    WinUpdaterSetting,
    ApiUrlSetting,
  ],
});

const AdvancedCategory = createCategory("general_advanced_category", {
  useTitle: () => intl.string(discordT.SETTINGS_ADVANCED),
  useInlineNotice: () => ({
    type: CategoryInlineNoticeType.INLINE_NOTICE,
    noticeType: "warning",
    useText: () => intl.string(t.REPLUGGED_SETTINGS_ADVANCED_NOTICE),
  }),
  buildLayout: () => [AdvancedAccordion],
});

const GeneralPanel = createPanel("general_panel", {
  useTitle: () => intl.string(discordT.SETTINGS_GENERAL),
  buildLayout: () => [AppearanceCategory, QuickCSSCategory, WindowCategory, AdvancedCategory],
});

export const GeneralSidebarItem = createSidebarItem("general_sidebar_item", {
  icon: RepluggedIcon,
  useTitle: () => intl.string(discordT.SETTINGS_GENERAL),
  buildLayout: () => [GeneralPanel],
});
