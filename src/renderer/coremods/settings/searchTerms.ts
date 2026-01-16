import { plugins, themes, webpack } from "@replugged";
import { t as discordT, intl } from "@common/i18n";
import { t } from "src/renderer/modules/i18n";
import type { ValueOf } from "type-fest";

import { AddonType } from "./pages";

export interface SearchState {
  query: string;
  isActive: boolean;
  isFocused: boolean;
  selected: string | null;
}

type Selector<S, T> = (state: S) => T;

export interface SearchStore {
  getField<K extends keyof SearchState>(key: K): SearchState[K];
  getState(): SearchState;
  getState<T>(selector: Selector<SearchState, T>): T;
  setState(
    next: Partial<SearchState> | ((prev: SearchState) => Partial<SearchState> | SearchState),
  ): void;
  resetState(): void;
  subscribe<T = SearchState>(
    listener: (value: T) => void,
    selector?: Selector<SearchState, T>,
    equalityFn?: (a: T, b: T) => boolean,
  ): () => void;
  useField<K extends keyof SearchState>(key: K): SearchState[K];
  useState(): SearchState;
  useState<T>(selector: Selector<SearchState, T>): T;
}

export const SearchStore: SearchStore = await webpack.waitForModule(
  webpack.filters.bySource('query:"",isActive:!1,isFocused'),
  { timeout: 10000 },
);

export const PageTypes = {
  Addon: "addon",
  General: "general",
  QuickCSS: "quick-css",
  Updater: "updater",
} as const;

export function usePageSearchTerms(
  page: ValueOf<typeof PageTypes>,
  addonType?: AddonType,
): () => string[] {
  if (page === PageTypes.Addon) {
    const type =
      addonType === AddonType.Theme
        ? intl.string(t.REPLUGGED_THEMES)
        : intl.string(t.REPLUGGED_PLUGINS);
    const addonsMap = addonType === AddonType.Theme ? themes.themes : plugins.plugins;

    return (): string[] =>
      [...addonsMap.values()].reduce(
        (acc: string[], x) => {
          acc.push(
            x.manifest.name,
            x.manifest.id,
            x.manifest.description,
            ...([x.manifest.author].flat().map(Object.values).flat() as string[]),
          );
          return acc;
        },
        [
          type,
          intl.formatToPlainString(t.REPLUGGED_ADDON_BROWSE, {
            type,
          }),
          intl.formatToPlainString(t.REPLUGGED_ADDONS_LOAD_MISSING, {
            type,
          }),
          intl.formatToPlainString(t.REPLUGGED_ADDONS_FOLDER_OPEN, {
            type,
          }),
        ],
      );
  }
  if (page === PageTypes.QuickCSS)
    return () => [intl.string(t.REPLUGGED_QUICKCSS), intl.string(t.REPLUGGED_QUICKCSS_FOLDER_OPEN)];
  if (page === PageTypes.Updater)
    return () => [
      intl.string(t.REPLUGGED_UPDATES_UPDATE_ALL),
      intl.string(t.REPLUGGED_UPDATES_CHECK),
      intl.string(discordT.UPDATE),
      intl.string(t.REPLUGGED_UPDATES_UPDATER),
      intl.string(t.REPLUGGED_UPDATES_OPTS_AUTO),
      intl.string(t.REPLUGGED_UPDATES_OPTS_INTERVAL),
      intl.string(t.REPLUGGED_UPDATES_UPDATER),
    ];

  return () => [
    intl.string(discordT.SETTINGS_GENERAL),
    intl.string(t.REPLUGGED_SETTINGS_BADGES),
    intl.string(t.REPLUGGED_SETTINGS_ADDON_EMBEDS),
    intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_ENABLE),
    intl.string(t.REPLUGGED_SETTINGS_QUICKCSS_AUTO_APPLY),
    intl.string(t.REPLUGGED_SETTINGS_DISABLE_MIN_SIZE),
    intl.string(t.REPLUGGED_SETTINGS_CUSTOM_TITLE_BAR),
    intl.string(t.REPLUGGED_SETTINGS_TRANSPARENT),
    intl.string(t.REPLUGGED_SETTINGS_TRANSPARENCY_BG_MATERIAL),
    intl.string(t.REPLUGGED_SETTINGS_TRANSPARENCY_VIBRANCY),
    intl.string(t.REPLUGGED_SETTINGS_DISCORD_EXPERIMENTS),
    intl.string(t.REPLUGGED_SETTINGS_DISCORD_DEVTOOLS),
    intl.string(t.REPLUGGED_SETTINGS_REACT_DEVTOOLS),
    intl.string(t.REPLUGGED_SETTINGS_KEEP_TOKEN),
    intl.string(t.REPLUGGED_SETTINGS_WIN_UPDATER),
    intl.string(t.REPLUGGED_SETTINGS_BACKEND),
  ];
}
