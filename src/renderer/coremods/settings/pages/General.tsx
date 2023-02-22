import { modal } from "@common";
import React from "@common/react";
import { Button, Divider, Flex, FormItem, SwitchItem, Text, TextInput } from "@components";
import * as settings from "../../../apis/settings";
import * as util from "../../../util";
import { Jsonifiable } from "type-fest";
import { Messages } from "@common/i18n";

export interface GeneralSettings {
  apiUrl: string;
  // pluginEmbeds: boolean;
  experiments: boolean;
  [key: string]: Jsonifiable;
}
const defaultSettings: Partial<GeneralSettings> = {
  apiUrl: "https://replugged.dev",
  // pluginEmbeds: false,
  experiments: false,
};
export const generalSettings = await settings.init<GeneralSettings, keyof typeof defaultSettings>(
  "rp-settings",
  defaultSettings,
);

export function getExperimentsEnabled() {
  return generalSettings.get("experiment", false);
}

export const General = (): React.ReactElement => {
  const { expValue, expOnChange } = util.useSetting(generalSettings, "experiments", false);
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
  const kKeys: number[] = [];
  let listener: (e: KeyboardEvent) => void;
  document.addEventListener(
    "keydown",
    (listener = function (e) {
      kKeys.push(e.keyCode);

      if (kKeys.toString().includes(konami)) {
        document.removeEventListener("keydown", listener);

        setSleep(true);
      }
    }),
  );

  return (
    // NOTE(lexisother): These are mock settings, none of these do or save anything
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        {/* TODO(lexisother): Add an i18n string */}
        <Text.H2>Settings</Text.H2>
      </Flex>

      <Divider style={{ margin: "20px 0px" }} />

      <FormItem
        title="Replugged API URL"
        note="Doing development of the Replugged API? Change the URL here to your testing instance so Replugged can connect to it."
        divider={true}
        style={{ marginBottom: "18px" }}>
        {/* NOTE(lexisother): For whoever is implementing the settings functionality, please update this accordingly! */}
        <TextInput
          {...util.useSetting(generalSettings, "apiUrl", "https://replugged.dev")}
          placeholder="https://example.com/api/v2"
        />
      </FormItem>

      {/* <SwitchItem
        {...util.useSetting(configs, "experiments", false)}
        note="Enable embedding plugins in chat">
        Plugin Embeds
      </SwitchItem> */}

      <SwitchItem
        // {...util.useSetting(generalSettings, "experiments", false)}
        value={expValue}
        onChange={(value) => {
          void modal
            .confirm({
              title: Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS,
              body: Messages.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS_DESC,
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
        note="Enable Discord experiments">
        Experiments
      </SwitchItem>

      {/* Sleeping? Wake up. */}
      {sleep && (
        <>
          <br />
          <br />
          <br />
          <span style={{ color: `hsl(${hue}, 100%, 50%)` }}>Wake up. Wake up. Wake up.</span>
        </>
      )}
    </>
  );
};
