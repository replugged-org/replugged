import { modal } from "@common";
import React from "@common/react";
import { Button, Divider, Flex, FormItem, SwitchItem, Text, TextInput } from "@components";
import * as settings from "../../../apis/settings";
import * as util from "../../../util";
import { Messages } from "@common/i18n";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type GeneralSettings = {
  apiUrl: string;
  // pluginEmbeds: boolean;
  experiments: boolean;
};

export const defaultSettings: Partial<GeneralSettings> = {
  apiUrl: "https://replugged.dev",
  // pluginEmbeds: false,
  experiments: false,
};

export const generalSettings = await settings.init<GeneralSettings, keyof typeof defaultSettings>(
  "dev.replugged.Settings",
  defaultSettings,
);

export const General = (): React.ReactElement => {
  const { value: expValue, onChange: expOnChange } = util.useSetting(
    generalSettings,
    "experiments",
  );
  const [hue, setHue] = React.useState(0);
  const [sleep, setSleep] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHue((hue + 1) % 360);
    });
    return () => cancelAnimationFrame(id);
  }, [hue]);

  /* @see view-source:https://sysspa.alyxia.dev/ lines 172 to 183 */
  const konami = "38,38,40,40,37,39,37,39,66,65";
  const [kKeys, setKKeys] = React.useState<number[]>([]);
  const listener = (e: KeyboardEvent): void => {
    setKKeys([...kKeys, e.keyCode]);

    if (kKeys.toString().includes(konami)) {
      document.removeEventListener("keydown", listener);

      setSleep(true);
    }
  };
  React.useEffect(() => {
    document.addEventListener("keydown", listener);

    return () => document.removeEventListener("keydown", listener);
  }, []);

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
                setTimeout(() => window.location.reload(), 250);
              }
            });
        }}
        note={Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC.format()}>
        {Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS}
      </SwitchItem>

      {/* Sleeping? Wake up. */}
      {sleep && (
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
