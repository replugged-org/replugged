import React from "@common/react";
import { getBySource } from "../../../modules/webpack";
import { Divider, Flex, FormItem, SwitchItem, Text, TextInput } from "@components";
import Users from "@common/users";
const { getCurrentUser } = Users;

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
    <div style={{ color: "var(--text-normal)" }}>
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
        <TextInput value="https://replugged.dev/api/v2" placeholder="https://example.com/api/v2" />
      </FormItem>

      <SwitchItem value={false} onChange={() => false} note="Enable embedding plugins in chat">
        Plugin Embeds
      </SwitchItem>

      <SwitchItem value={false} onChange={() => false} note="Enable Discord experiments">
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
    </div>
  );
};
