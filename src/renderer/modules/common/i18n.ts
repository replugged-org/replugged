import type {
  FormatFunction,
  IntlManager,
  IntlMessageGetter,
  MessageLoader,
  TypedIntlMessageGetter,
  astFormatter,
  makeReactFormatter,
  markdownFormatter,
  stringFormatter,
} from "@discord/intl";
import {
  filters,
  getExportsForProps,
  getFunctionBySource,
  waitForModule,
  waitForProps,
} from "../webpack";

type MessagesBinds = Record<string, TypedIntlMessageGetter<object>>;

type MessagesBindsProxy = MessagesBinds & {
  $$baseObject: MessagesBinds;
  $$loader: MessageLoader;
};

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
  intl: IntlManager & {
    format: FormatFunction<ReturnType<typeof makeReactFormatter>>;
    formatToPlainString: FormatFunction<typeof stringFormatter>;
    formatToMarkdownString: FormatFunction<typeof markdownFormatter>;
    formatToParts: FormatFunction<typeof astFormatter>;
  };
  t: MessagesBindsProxy;
  useSyncMessages: (messageLoader: MessageLoader) => void;
}

export interface Hash {
  runtimeHashMessageKey: (key: string) => string;
}

const intlMod = await waitForModule<I18n>(filters.bySource(/new \w+\.IntlManager/));

const getAvailableLocales = getFunctionBySource<I18n["getAvailableLocales"]>(
  intlMod,
  ".runtimeHashMessageKey",
)!;
const getLanguages = getFunctionBySource<I18n["getLanguages"]>(intlMod, /{return \w+\(\d+\)}/)!;
const intl = getExportsForProps<I18n["intl"]>(intlMod, ["defaultLocale", "currentLocale"])!;
const useSyncMessages = getFunctionBySource<I18n["useSyncMessages"]>(
  intlMod,
  /\w+=>\(0,\w+\.\w+\)\(\w+,\w+\)/,
)!;

// In case the name gets mangled
const discordT = intlMod.t ?? getExportsForProps<I18n["t"]>(intlMod, ["$$loader", "$$baseObject"])!;

const { runtimeHashMessageKey } = await waitForProps<Hash>("runtimeHashMessageKey");

export const t = new Proxy(discordT.$$baseObject, {
  get: (_t, key: string) => discordT[runtimeHashMessageKey(key)],
}) as MessagesBindsProxy;

export { getAvailableLocales, getLanguages, intl, useSyncMessages };
