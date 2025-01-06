import type {
  FormatFunction,
  IntlManager,
  IntlMessageGetter,
  TypedIntlMessageGetter,
  astFormatter,
  makeReactFormatter,
  markdownFormatter,
  stringFormatter,
} from "@discord/intl";
import { waitForProps } from "../webpack";

type MessagesBinds = Record<string, TypedIntlMessageGetter<object>>;

interface Locale {
  value: string;
  name: string;
  localizedName: IntlMessageGetter;
}

interface Language {
  name: string;
  englishName: string;
  code: string;
  postgresLang: string;
  enabled: boolean;
  enabledAPI?: boolean;
}

export interface I18n {
  getAvailableLocales: () => Locale[];
  getLanguages: () => Language[];
  getSystemLocale: (defaultLocale: string) => string;
  international: MessagesBinds;
  intl: IntlManager & {
    format: FormatFunction<ReturnType<typeof makeReactFormatter>>;
    formatToPlainString: FormatFunction<typeof stringFormatter>;
    formatToMarkdownString: FormatFunction<typeof markdownFormatter>;
    formatToParts: FormatFunction<typeof astFormatter>;
  };
  t: MessagesBinds;
}

export interface Hash {
  runtimeHashMessageKey: (key: string) => string;
}

const getI18n = async (): Promise<I18n> => {
  const {
    getAvailableLocales,
    getLanguages,
    getSystemLocale,
    international,
    intl,
    t: discordT,
  } = await waitForProps<I18n>("getAvailableLocales", "intl");
  const { runtimeHashMessageKey } = await waitForProps<Hash>("runtimeHashMessageKey");

  const t = new Proxy(discordT, {
    get: (t, key: string) => t[runtimeHashMessageKey(key)],
  });
  return { getAvailableLocales, getLanguages, getSystemLocale, international, intl, t };
};

export default getI18n();
