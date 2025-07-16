import { getLanguages, intl } from "@common/i18n";
import { Flex, FormNotice, Text } from "@components";
import { messagesLoader } from "i18n/en-US.messages";
import type React from "react";
import { WEBLATE_URL } from "src/constants";
import { t } from "../../modules/i18n";

export const percentages = new Map<string, number>();

export function Card(): React.ReactElement {
  return (
    <FormNotice
      title={intl.string(t.REPLUGGED_I18N)}
      body={intl.format(t.REPLUGGED_I18N_CONTRIBUTE, { weblateUrl: WEBLATE_URL })}
      type={FormNotice.Types.PRIMARY}
      style={{ marginBottom: 20 }}
    />
  );
}

export function Percentage(
  localeName: React.ReactElement<{ className: string; children: string }>,
  localizedName: React.ReactElement,
  flag: React.ReactElement,
): React.ReactElement {
  const name = localeName.props.children;
  const locale = getLanguages().find((language) => language.name === name)!.code;
  const percentage = percentages.get(locale);

  return (
    <>
      <Flex direction={Flex.Direction.VERTICAL}>
        {localeName}
        <Text variant="text-sm/normal" color="interactive-normal">
          {intl.format(t.REPLUGGED_I18N_TRANSLATED_PERCENTAGE, { translated: Number(percentage) })}
        </Text>
      </Flex>
      {localizedName}
      {flag}
    </>
  );
}

export function start(): void {
  const totalStrCount = Object.keys(messagesLoader.messages[messagesLoader.defaultLocale]).length;

  Object.entries(messagesLoader.localeImportMap).forEach(async ([locale, getStrings]) => {
    const strings = (await getStrings()).default;
    const strCount = Object.values(strings).filter((str) => Boolean(str)).length;
    const percentage = Math.floor((strCount / totalStrCount) * 100);
    percentages.set(locale, percentage);
  });
}
