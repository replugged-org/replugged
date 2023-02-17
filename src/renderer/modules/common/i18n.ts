import { filters, waitForModule } from "../webpack";
import EventEmitter from "events";

import type { RawModule } from "../../../types";
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

interface Formats {
  number: Record<"currency" | "percent", Intl.NumberFormatOptions>;
  date: Record<"short" | "medium" | "long" | "full", Intl.DateTimeFormatOptions>;
  time: Record<"short" | "medium" | "long" | "full", Intl.DateTimeFormatOptions>;
}

interface ASTSimpleFormat {
  type: "numberFormat" | "dateFormat" | "timeFormat";
  style: string;
}

interface ASTPluralFormat extends ASTPluralStyle {
  ordinal: false;
}

interface ASTSelectFormat {
  type: "selectFormat";
  options: ASTOptionalFormatPattern[];
}

interface ASTSelectOrdinalFormat extends ASTPluralStyle {
  ordinal: true;
}

interface ASTOptionalFormatPattern {
  type: "optionalFormatPattern";
  selector: string;
  value: ASTMessageFormatPattern;
}

interface ASTPluralStyle {
  type: "pluralFormat";
  offset: number;
  options: ASTOptionalFormatPattern[];
}

type ASTElementFormat =
  | ASTSimpleFormat
  | ASTPluralFormat
  | ASTSelectOrdinalFormat
  | ASTSelectFormat;

interface ASTArgumentElement {
  type: "argumentElement";
  id: string;
  format?: ASTElementFormat;
}

interface ASTMessageTextElement {
  type: "messageTextElement";
  value: string;
}

type ASTElement = ASTMessageTextElement | ASTArgumentElement;

interface ASTMessageFormatPattern {
  type: "messageFormatPattern";
  elements: ASTElement[];
}

interface LocaleData {
  locale: string;
  parentLocale?: string;
  pluralRuleFunction: PluralFunction | undefined;
}

interface ResolvedOptions {
  locale?: string;
}

type FormatXMLElementFn<T, R = string | T | Array<string | T>> = (parts: Array<string | T>) => R;
type IntlMessageValues = Record<string, Primitive | FormatXMLElementFn<string, string>>;

interface IntlMessageFormatConstructor {
  new (
    message: string | ASTMessageFormatPattern,
    locales: string | string[],
    formats: Formats | NestedObject,
  ): IntlMessageFormat;
  prototype: IntlMessageFormat;

  default: (
    message: string | ASTMessageFormatPattern,
    locales: string | string[],
    formats: Formats | NestedObject,
  ) => IntlMessageFormat;
  defaultLocale?: string;
  formats: Formats;

  /* eslint-disable @typescript-eslint/naming-convention */
  __addLocaleData: (data: LocaleData) => void;
  __localeData__: () => Record<string, LocaleData>;
  __parse: (message: string) => ASTMessageFormatPattern;
  /* eslint-enable @typescript-eslint/naming-convention */
}

interface NestedObject {
  [key: string]: string | NestedObject;
}

type PluralFunction = (value?: number, useOrdinal?: boolean) => string;
type Pattern = string | ASTPluralFormat | ASTSelectFormat;

interface IntlMessageFormat {
  constructor: IntlMessageFormatConstructor;

  resolvedOptions: () => ResolvedOptions;
  _compilePattern: (
    ast: ASTMessageFormatPattern,
    locales: string | string[],
    formats: Formats | NestedObject,
    pluralFn: PluralFunction,
  ) => Pattern[];
  _findPluralRuleFunction: (locale: string) => PluralFunction;
  _format: (pattern: Pattern[], values: IntlMessageValues) => ASTMessageFormatPattern;
  _mergeFormats: (
    defaults: Formats | NestedObject,
    formats: NestedObject,
  ) => Formats | NestedObject;
  _resolveLocale: (locales: string | string[]) => string;

  format: (values?: IntlMessageValues) => string;
  _locale: string;
}

interface IntlMessageObject {
  hasMarkdown: boolean;
  intlMessage: IntlMessageFormat;
  message: string;
  astFormat: (values?: string | IntlMessageValues) => NestedObject;
  format: (values?: IntlMessageValues) => string;
  getContext: (values?: string | IntlMessageValues) => Record<string, Primitive>;
  plainFormat: (values?: string | IntlMessageValues) => string;
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
