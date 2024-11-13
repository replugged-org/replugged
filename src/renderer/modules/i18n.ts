import type { I18n } from "@common";
import type { loadAllMessagesInLocale as LoadAllMessagesInLocale } from "@discord/intl";
import { waitForProps } from "@webpack";
import { DEFAULT_LOCALE } from "src/constants";
import type * as definitions from "../../../i18n/en-US.messages";

export let locale: string | undefined;
export let t: typeof definitions.default;
export let messagesLoader: typeof definitions.messagesLoader;

export async function load(): Promise<void> {
  const { intl } = await waitForProps<I18n>("getAvailableLocales", "intl");

  // ! HACK: This is a workaround until ignition issues are fixed.
  // We need to delay the import of the messages for intl to be loaded and use that module instead of @discord/intl directly.
  const { default: messages, messagesLoader: loader } = await import(
    "../../../i18n/en-US.messages"
  );
  t = messages;
  messagesLoader = loader;

  locale = intl.currentLocale || intl.defaultLocale || DEFAULT_LOCALE;

  intl.onLocaleChange((newLocale) => {
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
