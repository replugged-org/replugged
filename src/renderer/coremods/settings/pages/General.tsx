import React from "@common/react";
import { getBySource } from "../../../modules/webpack";
import { Divider, Flex, FormItem, SwitchItem, Text, TextInput } from "@components";
import Users from "@common/users";
import { settings, util } from "@replugged";
import { Jsonifiable } from "type-fest";
const { getCurrentUser } = Users;

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
const configs = await settings.init<GeneralSettings, keyof typeof defaultSettings>(
  "rp-settings",
  defaultSettings,
);

// I'm not going to be waiting for Notice to be added to @components before
// making this PR. Just switch it out later.
// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const NoticeMod = getBySource(/.\.messageType/) as {
  Z: React.ElementType;
  Q: Record<string, never>;
};
const { Z: Notice, Q: NoticeTypes } = NoticeMod;

export const General = (): React.ReactElement => {
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
  const kkeys: number[] = [];
  let listener: (e: KeyboardEvent) => void;
  document.addEventListener(
    "keydown",
    (listener = function (e) {
      kkeys.push(e.keyCode);

      if (kkeys.toString().includes(konami)) {
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

      <Notice messageType={NoticeTypes.ERROR}>
        <p>Hello {getCurrentUser().username}! These are the Replugged settings.</p>
        <p>
          Currently, we have nothing for you to configure! However, these settings are simply here
          so whoever is implementing functionality behind these switches and text fields doesn't
          have to make a layout for them.
        </p>
        <p>
          Please don't report any bugs saying the settings don't work, because this is intentional!
        </p>
      </Notice>

      <FormItem
        title="Replugged API URL"
        note="Doing development of the Replugged API? Change the URL here to your testing instance so Replugged can connect to it."
        divider={true}
        style={{ marginBottom: "18px" }}>
        {/* NOTE(lexisother): For whoever is implementing the settings functionality, please update this accordingly! */}
        <TextInput
          {...util.useSetting(configs, "apiUrl", "https://replugged.dev")}
          placeholder="https://example.com/api/v2"
        />
      </FormItem>

      {/* <SwitchItem
        {...util.useSetting(configs, "experiments", false)}
        note="Enable embedding plugins in chat">
        Plugin Embeds
      </SwitchItem> */}

      <SwitchItem
        {...util.useSetting(configs, "experiments", false)}
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
