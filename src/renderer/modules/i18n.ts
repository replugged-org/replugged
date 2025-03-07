import type { loadAllMessagesInLocale as LoadAllMessagesInLocale } from "@discord/intl";
import { i18n } from "@common";
import { waitForProps } from "@webpack";
import { DEFAULT_LOCALE } from "src/constants";
import { messagesLoader, default as t } from "i18n/en-US.messages";

export let locale: string | undefined;
export { t, messagesLoader };

export function load(): void {
  void messagesLoader.waitForDefaultLocale(true);
  locale = i18n.intl.currentLocale || i18n.intl.defaultLocale || DEFAULT_LOCALE;

  i18n.intl.onLocaleChange((newLocale) => {
    locale = newLocale;
    void addReCelledStrings();
  });
  void addReCelledStrings();
}

export async function addReCelledStrings(): Promise<void> {
  const { loadAllMessagesInLocale } = await waitForProps<{
    loadAllMessagesInLocale: typeof LoadAllMessagesInLocale;
  }>("loadAllMessagesInLocale");

  if (locale) {
    void loadAllMessagesInLocale(locale);
  }
}
