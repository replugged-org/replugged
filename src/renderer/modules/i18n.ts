import { i18n } from "@common";
import type { RepluggedTranslations } from "../../types";

const strings = await RepluggedNative.i18n.getStrings();
const overrides = await RepluggedNative.i18n.getOverrides();

export let locale: string | undefined;
export const messages = new Map();

export function load(): void {
  loadAllStrings(strings);
  loadAllStrings(overrides);

  locale = i18n._chosenLocale;
  i18n.on("locale", (newLocale: string) => {
    locale = newLocale;
    i18n.loadPromise.then(addRepluggedStrings)!;
  });

  addRepluggedStrings();
}

export function addRepluggedStrings(): void {
  const { messages: DiscordMessages, defaultMessages } = i18n._provider._context;

  i18n._applyMessagesForLocale(
    Object.assign(DiscordMessages, messages.get(locale)),
    locale,
    Object.assign(defaultMessages, messages.get("en-US")),
  );
}

export function loadAllStrings(strings: RepluggedTranslations): void {
  Object.keys(strings).forEach((locale) => loadStrings(locale, strings[locale]));
}

export function loadStrings(locale: string, strings: RepluggedTranslations): void {
  if (!messages.get(locale)) {
    messages.set(locale, strings);
  } else {
    messages.set(locale, {
      ...messages.get(locale),
      ...strings,
    });
  }

  addRepluggedStrings();
}
