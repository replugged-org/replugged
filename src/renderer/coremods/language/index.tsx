import { intl } from "@common/i18n";
import { messagesLoader } from "i18n/en-US.messages";
import type React from "react";
import { t } from "../../modules/i18n";

const percentages = new Map<string, number>();

export function getFormattedPercentage(locale: string): React.ReactNode {
  const percentage = percentages.get(locale);
  return intl.format(t.REPLUGGED_I18N_TRANSLATED_PERCENTAGE, { translated: Number(percentage) });
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
