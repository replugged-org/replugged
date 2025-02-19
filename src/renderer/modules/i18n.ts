import type { loadAllMessagesInLocale as LoadAllMessagesInLocale } from "@discord/intl";
import { i18n } from "@common";
import { waitForProps } from "@webpack";
import { DEFAULT_LOCALE } from "src/constants";
export let locale: string | undefined;
export { default as t, messagesLoader } from "i18n/en-US.messages";
export function load(): void {
  locale = i18n.intl.currentLocale || i18n.intl.defaultLocale || DEFAULT_LOCALE;
  i18n.intl.onLocaleChange((newLocale) => {
    locale = newLocale;
    void addRepluggedStrings();
  });
  void addRepluggedStrings();
}

export async function addRepluggedStrings(): Promise<void> {
  const { loadAllMessagesInLocale } = await waitForProps<{
    loadAllMessagesInLocale: typeof LoadAllMessagesInLocale;
  }>("loadAllMessagesInLocale");

  if (locale) {
    void loadAllMessagesInLocale(locale);
  }
}
