## ⭐ Highlights

- Added a new setting to toggle Quick CSS
  ([2c86d71](https://github.com/replugged-org/replugged/commit/2c86d71)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#737](https://github.com/replugged-org/replugged/pull/737))
- Added the ability to recall the last used custom slash command by pressing the up key
  ([2c598e5](https://github.com/replugged-org/replugged/commit/2c598e5)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#717](https://github.com/replugged-org/replugged/pull/717))
- Added a custom theme color for Replugged's notices
  ([d68b127](https://github.com/replugged-org/replugged/commit/d68b127)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#711](https://github.com/replugged-org/replugged/pull/711))
- Refreshed the UI of Replugged's settings:
  - Reposition buttons on addon pages to take up a full line below the heading
    ([1d5fa5a](https://github.com/replugged-org/replugged/commit/1d5fa5a)) (by
    [@yofukashino](https://github.com/yofukashino) in
    [#723](https://github.com/replugged-org/replugged/pull/723))
  - Reposition buttons and author(s) on addon cards to the bottom
    ([80b13b3](https://github.com/replugged-org/replugged/commit/80b13b3)) (by
    [@yofukashino](https://github.com/yofukashino) in
    [#685](https://github.com/replugged-org/replugged/pull/685))
  - Organize the General page with TabBars for clearer navigation
    ([0f74600](https://github.com/replugged-org/replugged/commit/0f74600)) (by
    [@fedeericodl](https://github.com/fedeericodl))
- Added a new coremod for decoding React error codes, showing the error message directly instead of
  a code ([1bd34cf](https://github.com/replugged-org/replugged/commit/1bd34cf)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#733](https://github.com/replugged-org/replugged/pull/733))
- Added custom tray menu items; one to show the current version, one for updating Replugged (useful
  if the updater can't be opened), and another as a shortcut to developer tools
  ([a53982c](https://github.com/replugged-org/replugged/commit/a53982c)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#740](https://github.com/replugged-org/replugged/pull/740))
- Added an advanced setting to toggle whether Discord hides the token in localStorage when developer
  tools are open; previously this was always enabled, but it is now configurable and disabled by
  default ([58b8a0e](https://github.com/replugged-org/replugged/commit/58b8a0e)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Added support for theme presets, allowing themes to offer multiple built-in variations
  ([d16dc24](https://github.com/replugged-org/replugged/commit/d16dc24)) (by
  [@12944qwerty](https://github.com/12944qwerty) in
  [#570](https://github.com/replugged-org/replugged/pull/570))
- Added a new setting for managing transparency of the window
  ([3a4f0c5](https://github.com/replugged-org/replugged/commit/3a4f0c5)) (by
  [@EastArctica](https://github.com/EastArctica) in
  [#540](https://github.com/replugged-org/replugged/pull/540))
- Added a new setting for disabling the minimum size restrictions of the window
  ([c771d6f](https://github.com/replugged-org/replugged/commit/c771d6f)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Added a patch to automatically keep Replugged plugged after Discord updates on Windows, with a new
  toggle available in settings
  ([203d078](https://github.com/replugged-org/replugged/commit/203d078)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#707](https://github.com/replugged-org/replugged/pull/707))

## ✨ Enhancements

- Added `getBoundMethods` in util to create an object with all prototype methods bound to a given
  instance ([546b998](https://github.com/replugged-org/replugged/commit/546b998)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Added `info` and `verbose` methods to the Logger
  ([c3dd97e](https://github.com/replugged-org/replugged/commit/c3dd97e)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#727](https://github.com/replugged-org/replugged/pull/727))
- Added support for `stream` and `supportFetchAPI` on our protocol
  ([088409c](https://github.com/replugged-org/replugged/commit/088409c)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#732](https://github.com/replugged-org/replugged/pull/732))
- Added `useValue` on SettingsManager for accessing settings in React components with automatic
  updates when values change ([6d1abfe](https://github.com/replugged-org/replugged/commit/6d1abfe))
  (by [@yofukashino](https://github.com/yofukashino) in
  [#704](https://github.com/replugged-org/replugged/pull/704))
- Export `wpRequire` and `sourceStrings` for more advanced webpack module searches
  ([347e97b](https://github.com/replugged-org/replugged/commit/347e97b)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#734](https://github.com/replugged-org/replugged/pull/734))
- Enabled more staff-only features when the experiments setting is turned on:
  - Show the Mana playground embed in chat (`dev://mana/COMPONENT_NAME`)
    ([c3ae426](https://github.com/replugged-org/replugged/commit/c3ae426)) (by
    [@fedeericodl](https://github.com/fedeericodl))
  - Show Playgrounds and Build Overrides menus, and add the Playgrounds tab in the Staff Help Popout
    ([7834bf4](https://github.com/replugged-org/replugged/commit/7834bf4)) (by
    [@fedeericodl](https://github.com/fedeericodl))
- Download and use React DevTools from Chrome Web Store; always updated to latest version
  ([ea67967](https://github.com/replugged-org/replugged/commit/ea67967)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Added support for `\i` and `$exports` placeholders in plaintext patches and filters
  ([fc82ad3](https://github.com/replugged-org/replugged/commit/fc82ad3)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#706](https://github.com/replugged-org/replugged/pull/706))
- Added `getComponentBySource` to search modules for React components, including `React.memo` and
  `React.forwardRef` ([c7a56ee](https://github.com/replugged-org/replugged/commit/c7a56ee)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Added `discord-client-types`, centralized type definitions for Discord modules
  ([32b83d2](https://github.com/replugged-org/replugged/commit/32b83d2)) (by
  [@fedeericodl](https://github.com/fedeericodl) in
  [#736](https://github.com/replugged-org/replugged/pull/736)):
  - Remove all previously bundled component types
  - Add new components: `Anchor`, `Breadcrumbs`, `SearchBar`, `TabBar`
  - Replace legacy `TextInput` with the new one from Mana
  - Add `marginStyles` common module
- Added `KeyRecorder` component for recording keyboard combinations
  ([d616afc](https://github.com/replugged-org/replugged/commit/d616afc)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#511](https://github.com/replugged-org/replugged/pull/511))
- Added data attributes for themes on the root element, messages, avatars, and TabBars
  ([d3c50f6](https://github.com/replugged-org/replugged/commit/d3c50f6)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#719](https://github.com/replugged-org/replugged/pull/719))
- Added `ColorPicker` component for selecting colors
  ([ecb7f0e](https://github.com/replugged-org/replugged/commit/ecb7f0e)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#694](https://github.com/replugged-org/replugged/pull/694))
- Updated components and Replugged settings to be similar to new Discord settings
  ([57790be](https://github.com/replugged-org/replugged/commit/57790be)) (by
  [@fedeericodl](https://github.com/fedeericodl)):
  - Add new components: `FieldSet`, `FormControl`, and `Stack`
  - Remove all "Item" variants
  - Replace legacy `TextArea` with Mana version

## 🐞 Bug Fixes

- Fixed an issue with `virtualMerge` failing when `ownKeys` needs to return duplicate keys
  ([5429962](https://github.com/replugged-org/replugged/commit/5429962)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#730](https://github.com/replugged-org/replugged/pull/730))
- Fixed an issue with custom slash command attachments being undefined
  ([5da33b5](https://github.com/replugged-org/replugged/commit/5da33b5)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#716](https://github.com/replugged-org/replugged/pull/716))
- Fixed an issue with images not appearing in ephemeral custom slash commands
  ([5d03adf](https://github.com/replugged-org/replugged/commit/5d03adf)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#715](https://github.com/replugged-org/replugged/pull/715))
- Log a warning if plaintext patch had no effect; can be silenced by setting `warn: false`
  ([06d1013](https://github.com/replugged-org/replugged/commit/06d1013)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#729](https://github.com/replugged-org/replugged/pull/729))
- Fixed an issue with custom version not being shown in settings
  ([63c83ac](https://github.com/replugged-org/replugged/commit/63c83ac)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Wrap setting pages with `ErrorBoundary` to avoid crashing the whole client if an error occurs
  ([0064dd6](https://github.com/replugged-org/replugged/commit/0064dd6)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Fixed undefined `FormText` component
  ([fe5d21d](https://github.com/replugged-org/replugged/commit/fe5d21d)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Fixed language coremod plaintext patches
  ([893701e](https://github.com/replugged-org/replugged/commit/893701e)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Fixed incomplete profile data for addon author user modals
  ([05bee34](https://github.com/replugged-org/replugged/commit/05bee34)) (by
  [@fedeericodl](https://github.com/fedeericodl))

## 📰 Other Changes

- Extend types of `GuildRoleStore` and export functions not on prototype
  ([b82f3ae](https://github.com/replugged-org/replugged/commit/b82f3ae)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#725](https://github.com/replugged-org/replugged/pull/725))
- Change plugin init timeout from 5s → 10s
  ([b352479](https://github.com/replugged-org/replugged/commit/b352479)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#731](https://github.com/replugged-org/replugged/pull/731))
- Add back ability to use hashed keys on Discord's translation messages
  ([dd10072](https://github.com/replugged-org/replugged/commit/dd10072)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#738](https://github.com/replugged-org/replugged/pull/738))
- Use correct string for reload/relaunch modal
  ([58b8a0e](https://github.com/replugged-org/replugged/commit/58b8a0e)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#744](https://github.com/replugged-org/replugged/pull/744))
- Rewrite and improve webpack documentation
  ([7f68706](https://github.com/replugged-org/replugged/commit/7f68706)) (by
  [@fedeericodl](https://github.com/fedeericodl))
- Refactor RPC handling; moved logic to dedicated API and avoid modifying Discord's commands object
  ([b886b41](https://github.com/replugged-org/replugged/commit/b886b41)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#745](https://github.com/replugged-org/replugged/pull/745))
- Change `getById` typings to accept both number and string IDs
  ([1018f18](https://github.com/replugged-org/replugged/commit/1018f18)) (by
  [@yofukashino](https://github.com/yofukashino) in
  [#748](https://github.com/replugged-org/replugged/pull/748))
- Dependencies updates ([77f98de](https://github.com/replugged-org/replugged/commit/77f98de)) (by
  [@fedeericodl](https://github.com/fedeericodl))
