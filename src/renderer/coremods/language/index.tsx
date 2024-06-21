import { Messages } from "@common/i18n";
import { Flex, FormNotice, Text } from "@components";
import React from "react";
import { WEBLATE_URL } from "src/constants";
import i18n from "../../modules/common/i18n";
import { messages } from "../../modules/i18n";

const defaultLocale = "en-US";

export const percentages = new Map<string, number>();

export function Card(): React.ReactElement {
  return (
    <FormNotice
      title={Messages.REPLUGGED_I18N}
      body={Messages.REPLUGGED_I18N_CONTRIBUTE.format({ weblateUrl: WEBLATE_URL })}
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
  const name = localeName.props.children as string;
  const locale = i18n.getLanguages().find((language) => language.name === name)!.code;
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
    const strCount = Object.values(strings).filter((str) => str !== "").length;
    const percentage = Math.floor((strCount / totalStrCount) * 100);
    percentages.set(locale, percentage);
  });
}
