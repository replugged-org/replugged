import { modal } from "@common";
import React from "@common/react";
import {
  Button,
  ButtonItem,
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
import { getByProps } from "@webpack";
import { Logger } from "@replugged";

const logger = Logger.coremod("GeneralSettings");

export const generalSettings = await settings.init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

const konamiCode = ["38", "38", "40", "40", "37", "39", "37", "39", "66", "65"];

function reloadSidebar(): void {
  const sidebarClassMod = getByProps<Record<"sidebar" | "sidebarRegion", string>>(
    "sidebar",
    "sidebarRegion",
  );
  if (!sidebarClassMod) {
    logger.error("Failed to find sidebar class module");
    return;
  }

  const sidebar = document.querySelector(`.${sidebarClassMod.sidebar}`);
  if (!sidebar) {
    logger.error("Failed to find sidebar element");
    return;
  }

  const sidebarOwner = util.getOwnerInstance(sidebar) as Record<string, unknown> & {
    forceUpdate: () => void;
  };
  if (!sidebarOwner) {
    logger.error("Failed to find sidebar owner instance");
    return;
  }
  if (!sidebarOwner.forceUpdate) {
    logger.error("Failed to find sidebar owner forceUpdate");
    return;
  }

  sidebarOwner.forceUpdate();
}

export const General = (): React.ReactElement => {
  const { value: expValue, onChange: expOnChange } = util.useSetting(
    generalSettings,
    "experiments",
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

      {/* <SwitchItem
        {...util.useSetting(configs, "experiments", false)}
        note="Enable embedding plugins in chat">
        Plugin Embeds
      </SwitchItem> */}

      <SwitchItem
        {...util.useSetting(generalSettings, "badges")}
        note={Messages.REPLUGGED_SETTINGS_BADGES_DESC}>
        {Messages.REPLUGGED_SETTINGS_BADGES}
      </SwitchItem>

      <SwitchItem
        value={expValue}
        onChange={(value) => {
          if (value) {
            void modal
              .confirm({
                title: Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS,
                body: Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC.format(),
                confirmText: Messages.REPLUGGED_CONFIRM,
                confirmColor: Button.Colors.RED,
              })
              .then((answer) => {
                if (answer) {
                  expOnChange(value);
                  reloadSidebar();
                }
              });
          } else {
            expOnChange(value);
            reloadSidebar();
          }
        }}
        note={Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC.format()}>
        {Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS}
      </SwitchItem>

      <SwitchItem
        {...util.useSetting(generalSettings, "autoApplyQuickCss")}
        note={Messages.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY_DESC}>
        {Messages.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY}
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
