import { filters, waitForModule } from "..";
import EventEmitter from "events";

import type { RawModule } from "../../../../types";
import type { Primitive } from "type-fest";
import type { Rule } from "./parser";

type LocaleCallback = (locale?: string) => void;
type ProxyCallback = (context?: ProviderContext) => ProxyConstructor;

interface Events {
  locale: LocaleCallback[];
  newListener: (eventName?: "locale") => void;
}

interface Locale {
  value: string;
  name: string;
  localizedName: string;
}

interface Language {
  name: string;
  englishName: string;
  code: string;
  postgresLang: string;
  enabled: boolean;
  enabledAPI?: boolean;
}

interface ProviderContext {
  messages: Messages;
  defaultMessages: Messages;
  locale: string;
}

interface Provider {
  _context: ProviderContext;
  _createProxy: (context?: ProviderContext) => ProxyConstructor;
  _getParsedMessages: (
    context: ProviderContext,
    key?: string,
    proxyCallback?: ProxyCallback,
  ) => Message;
  _parsedMessages: Messages;
  refresh: (context: ProviderContext) => void;
  getMessages: () => Messages;
}

type FormatXMLElementFn<T, R = string | T | Array<string | T>> = (parts: Array<string | T>) => R;
type IntlMessageValues = Record<string, Primitive | FormatXMLElementFn<string, string>>;

// @todo: Type method parameters and returns
interface IntlMessageFormatConstructor {
  new (message: unknown, locales: unknown, formats: unknown): unknown;
  prototype: IntlMessageFormat;

  default: (message: unknown, locales: unknown, formats: unknown) => unknown;
  defaultLocale: string | undefined;
  formats: object;

  /* eslint-disable @typescript-eslint/naming-convention */
  __addLocaleData: () => unknown;
  __localeData__: () => unknown;
  __parse: (message: unknown) => unknown;
  /* eslint-enable @typescript-eslint/naming-convention */
}

// @todo: Type method parameters and returns
interface IntlMessageFormat {
  constructor: IntlMessageFormatConstructor;

  resolvedOptions(): { locale: string };
  _compilePattern: (ast: unknown, locales: unknown, formats: unknown, pluralFn: unknown) => unknown;
  _findPluralRuleFunction: (locale: string) => unknown;
  _format: (pattern: unknown, values: unknown) => unknown;
  _mergeFormats: (defaults: unknown, formats: unknown) => unknown;
  _resolveLocale: (locales: string | string[]) => unknown;

  format: (values?: IntlMessageValues) => string;
  _locale: string;
}

interface IntlMessageObject {
  hasMarkdown: boolean;
  intlMessage: IntlMessageFormat;
  message: string;
  astFormat: (values?: IntlMessageValues) => unknown; // @todo: Type return
  format: (values?: IntlMessageValues) => string;
  getContext: (values?: IntlMessageValues) => Record<string, Primitive>;
  plainFormat: (values?: IntlMessageValues) => string;
}

type Message = string & IntlMessageObject;
type Messages = Record<string, Message>;

export interface I18n extends EventEmitter {
  Messages: Messages;
  loadPromise: Promise<void>;
  _chosenLocale: string | undefined;
  _events: Events;
  _eventsCount: number;
  _getMessages: <T extends string>(locale?: T) => T extends "en-US" ? Messages : Promise<Messages>;
  _getParsedMessages: (
    context: ProviderContext,
    key?: string,
    createProxy?: ProxyCallback,
  ) => Message;
  _handleNewListener: (eventName?: "locale") => void;
  _languages: Language[];
  _maxListeners: number | undefined;
  _provider: Provider;
  _requestedLocale: string | undefined;

  getAvailableLocales: () => Locale[];
  getDefaultLocale: () => string;
  getLanguages: () => Language[];
  getLocale: () => string;
  getLocaleInfo: () => Language;
  setLocale: (locale?: string) => void;
  setUpdateRules: (rules: Record<string, Rule>) => void;
  updateMessagesForExperiment: (
    locale: string,
    callback: (messages?: Messages) => Messages,
  ) => void;
  _applyMessagesForLocale: (
    messages: Messages,
    locale?: string,
    defaultMessages?: Messages,
  ) => void;
  _fetchMessages: <T extends string>(
    locale?: T,
  ) => T extends "en-US" ? Messages | Error : Promise<Messages>;
  _findMessages: (locale?: string) => Messages | Error;
  _loadMessagesForLocale: (locale?: string) => Promise<void>;
}

const i18n = await waitForModule<RawModule & I18n>(filters.byProps("Messages", "getLanguages"));

export const { Messages } = i18n;

export default i18n;
