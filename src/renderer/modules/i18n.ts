import type { I18n } from "@common";
import { loadAllMessagesInLocale } from "@discord/intl";
import { waitForProps } from "@webpack";
import { DEFAULT_LOCALE } from "src/constants";
import messages from "../../../i18n/en-US.messages";

export let locale: string | undefined;
export const t = messages;

export async function load(): Promise<void> {
  const { intl } = await waitForProps<I18n>("getAvailableLocales", "intl");

  locale = intl.currentLocale || intl.defaultLocale || DEFAULT_LOCALE;

  intl.onLocaleChange((newLocale) => {
    locale = newLocale;
    addRepluggedStrings();
  });
}

export function addRepluggedStrings(): void {
  if (locale) {
    void loadAllMessagesInLocale(locale);
  }
}
