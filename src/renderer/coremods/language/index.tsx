import { Messages } from "@common/i18n";
import { Flex, FormNotice, Text } from "@components";
import React from "react";
import i18n from "../../modules/common/i18n";
import { messages } from "../../modules/i18n";

const defaultLocale = "en-US";
const weblateUrl = "https://i18n.replugged.dev";

const percentages = new Map();

export function Card(): React.ReactElement {
  return (
    <FormNotice
      title="Replugged Translations"
      body={Messages.REPLUGGED_I18N_CONTRIBUTE.format({ weblateUrl })}
      type={FormNotice.Types.PRIMARY}
      style={{ marginBottom: 20 }}
    />
  );
}

export function Percentage(
  localeName: React.ReactElement,
  localizedName: React.ReactElement,
  flag: React.ReactElement,
): React.ReactElement {
  const name = localeName.props.children;
  const locale = i18n.getLanguages().find((language) => language.name === name)?.code;
  const percentage = percentages.get(locale);

  return (
    <>
      <Flex direction={Flex.Direction.VERTICAL}>
        {localeName}
        <Text variant="text-sm/normal" color="interactive-normal">
          {Messages.REPLUGGED_I18N_TRANSLATED_PERCENTAGE.format({ translated: percentage })}
        </Text>
      </Flex>
      {localizedName}
      {flag}
    </>
  );
}

export function start(): void {
  const totalStrCount = Object.keys(messages.get(defaultLocale)).length;

  messages.forEach((strings, locale) => {
    const percentage = Math.floor((Object.keys(strings).length / totalStrCount) * 100);
    percentages.set(locale, percentage);
  });
}
