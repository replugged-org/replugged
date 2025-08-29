import { css } from "@codemirror/lang-css";
import { EditorState } from "@codemirror/state";
import { React, flux, fluxDispatcher, toast } from "@common";
import { t as discordT, intl } from "@common/i18n";
import { Button, Clickable, Flex, Text, Tooltip } from "@components";
import { webpack } from "@replugged";
import { EditorView, basicSetup } from "codemirror";
import { t } from "src/renderer/modules/i18n";
import { githubDark, githubLight } from "./codemirror-github";
import { generalSettings } from "./General";

import "./QuickCSS.css";
import type { Store } from "@common/flux";
import Icons from "../icons";

interface UseCodeMirrorOptions {
  value?: string;
  onChange?: (code: string) => unknown;
  container?: HTMLDivElement | null;
}

interface ThemeModule {
  theme: "light" | "dark";
  addChangeListener: (listener: () => unknown) => unknown;
  removeChangeListener: (listener: () => unknown) => unknown;
}

const PopoutWindowStore = await webpack.waitForStore<
  { getWindowOpen: (key: string) => boolean; getIsAlwaysOnTop: (key: string) => boolean } & Store
>("PopoutWindowStore", { timeout: 10_000 });

const PopoutContext = await webpack
  .waitForModule<
    Record<string, unknown>
  >(webpack.filters.bySource("Missing guestWindow reference"), { timeout: 10_000 })
  .then(
    (m) =>
      Object.values(m).find((c) => typeof c === "object") as React.MemoExoticComponent<
        React.FC<{ withTitleBar?: boolean; windowKey: string; children: React.ReactElement }>
      >,
  );

const WindowKey = "DISCORD_REPLUGGED_QUICKCSS";

function useTheme(): "light" | "dark" {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  const themeMod = webpack.getByProps<ThemeModule>(
    "theme",
    "addChangeListener",
    "removeChangeListener",
  );

  if (!themeMod) return theme;

  const themeChange = (): void => {
    setTheme(themeMod.theme);
  };

  React.useEffect(() => {
    themeChange();
    themeMod.addChangeListener(themeChange);

    return () => {
      themeMod.removeChangeListener(themeChange);
    };
  }, []);

  return theme;
}

function useCodeMirror({ value: initialValueParam, onChange, container }: UseCodeMirrorOptions): {
  value: string;
  setValue: (value: string) => void;
} {
  const theme = useTheme();

  const [value, setValue] = React.useState("");
  const [view, setView] = React.useState<EditorView | undefined>(undefined);

  const [update, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

  React.useEffect(() => {
    if (initialValueParam) {
      setValue(initialValueParam);
      forceUpdate();
    }
  }, [initialValueParam]);

  React.useEffect(() => {
    if (!container) return undefined;
    if (view) view.destroy();

    const newView = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          css(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setValue(update.state.doc.toString());
              onChange?.(update.state.doc.toString());
            }
          }),
          theme === "light" ? githubLight : githubDark,
        ],
      }),
      parent: container,
    });
    setView(newView);

    container.setAttribute("data-theme", theme);

    return () => {
      newView.destroy();
      setView(undefined);
    };
  }, [container, theme, update]);

  const customSetValue = React.useCallback(
    (value: string) => {
      setValue(value);
      forceUpdate();
    },
    [view],
  );

  return { value, setValue: customSetValue };
}

const NavigationButtons = ({ windowKey }: { windowKey: string }): React.ReactElement => {
  const isAlwaysOnTop = flux.useStateFromStores([PopoutWindowStore], () =>
    PopoutWindowStore.getIsAlwaysOnTop(WindowKey),
  );
  return (
    <span className="replugged-quickcss-popout-nagivation-container">
      <Tooltip
        text={intl.string(
          isAlwaysOnTop ? discordT.POPOUT_REMOVE_FROM_TOP : discordT.POPOUT_STAY_ON_TOP,
        )}>
        <Clickable
          onClick={() => {
            fluxDispatcher.dispatch({
              type: "POPOUT_WINDOW_SET_ALWAYS_ON_TOP",
              alwaysOnTop: !isAlwaysOnTop,
              key: windowKey,
            });
          }}
          className="replugged-quickcss-popout-nagivation-button">
          {isAlwaysOnTop ? <Icons.Unpin /> : <Icons.Pin />}
        </Clickable>
      </Tooltip>
      <Tooltip text={intl.string(discordT.TITLE_BAR_MINIMIZE_WINDOW)}>
        <Clickable
          onClick={() => {
            DiscordNative.window.minimize(windowKey);
          }}
          className="replugged-quickcss-popout-nagivation-button">
          <Icons.Minimize />
        </Clickable>
      </Tooltip>
      <Tooltip text={intl.string(discordT.TITLE_BAR_MAXIMIZE_WINDOW)}>
        <Clickable
          onClick={() => {
            DiscordNative.window.maximize(windowKey);
          }}
          className="replugged-quickcss-popout-nagivation-button">
          <Icons.Maximize />
        </Clickable>
      </Tooltip>
      <Tooltip text={intl.string(discordT.TITLE_BAR_CLOSE_WINDOW)}>
        <Clickable
          onClick={() => {
            DiscordNative.window.close(windowKey);
          }}
          className="replugged-quickcss-popout-nagivation-button replugged-quickcss-close-popout">
          <Icons.Close />
        </Clickable>
      </Tooltip>
    </span>
  );
};

const QuickCSSPanel = ({ isPopout }: { isPopout?: boolean }): React.ReactElement => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { value, setValue } = useCodeMirror({
    container: ref.current,
  });
  const [ready, setReady] = React.useState(false);

  const autoApply = generalSettings.useValue("autoApplyQuickCss");

  const reload = (): void => window.replugged.quickCSS.reload();
  const reloadAndToast = (): void => {
    reload();
    toast.toast(intl.string(t.REPLUGGED_TOAST_QUICKCSS_RELOAD));
  };

  const openPopout = (): void => {
    fluxDispatcher.dispatch({
      type: "POPOUT_WINDOW_OPEN",
      key: WindowKey,
      features: {
        frame: false,
        menubar: false,
        toolbar: false,
        location: false,
        directories: false,
        minWidth: 854,
        minHeight: 480,
      },
      render: () => (
        <PopoutContext withTitleBar={false} windowKey={WindowKey}>
          <div className="root replugged-quickcss-popout-root">
            <QuickCSSPanel isPopout />
          </div>
        </PopoutContext>
      ),
    });
  };

  React.useEffect(() => {
    void window.RepluggedNative.quickCSS.get().then((val: string) => {
      setValue(val);
      setReady(true);
    });

    // Save on CTRL + S / CMD + S
    const listener = (e: KeyboardEvent): void => {
      // XOR gate for CTRL / CMD (one of them must be pressed but not both)
      if (e.key === "s" && e.ctrlKey !== e.metaKey) {
        e.preventDefault();
        reloadAndToast();
      }
      if (e.key === "Escape" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        fluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
      }
    };

    const toogleKeybinds = (enabled: boolean): void => {
      fluxDispatcher.dispatch({
        type: "KEYBINDS_ENABLE_ALL_KEYBINDS",
        enable: isPopout || enabled,
      });
    };

    window.addEventListener("keydown", listener);
    toogleKeybinds(false);

    return () => {
      window.removeEventListener("keydown", listener);
      toogleKeybinds(true);
    };
  }, []);

  const [reloadTimer, setReloadTimer] = React.useState<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    if (!ready) return;
    window.RepluggedNative.quickCSS.save(value);

    // Debounce the auto reloading
    if (reloadTimer) clearTimeout(reloadTimer);
    if (autoApply) setReloadTimer(setTimeout(reload, 500));
  }, [value]);

  return (
    <>
      <div ref={ref} id="replugged-quickcss-wrapper">
        <Flex
          className="replugged-quickcss-header"
          justify={Flex.Justify.BETWEEN}
          align={Flex.Align.CENTER}>
          <Text.H2>{intl.string(t.REPLUGGED_QUICKCSS)}</Text.H2>
          <Flex className="replugged-quickcss-header-buttons">
            {!isPopout ? (
              <Tooltip text={intl.string(discordT.POPOUT_PLAYER)}>
                <Clickable
                  onClick={openPopout}
                  className="replugged-quickcss-popout-nagivation-button">
                  <Icons.Popout />
                </Clickable>
              </Tooltip>
            ) : (
              <NavigationButtons windowKey={WindowKey} />
            )}
            <Button
              onClick={() => window.RepluggedNative.quickCSS.openFolder()}
              color={Button.Colors.PRIMARY}
              look={Button.Looks.OUTLINED}>
              {intl.string(t.REPLUGGED_QUICKCSS_FOLDER_OPEN)}
            </Button>
            {autoApply ? null : (
              <Button onClick={reloadAndToast}>
                {intl.string(t.REPLUGGED_QUICKCSS_CHANGES_APPLY)}
              </Button>
            )}
          </Flex>
        </Flex>
      </div>
    </>
  );
};

export const QuickCSS = (): React.ReactElement => {
  const isPopoutOpen = flux.useStateFromStores([PopoutWindowStore], () =>
    PopoutWindowStore.getWindowOpen(WindowKey),
  );
  return isPopoutOpen ? (
    <>
      <Flex align={Flex.Align.CENTER} justify={Flex.Justify.CENTER} style={{ height: "100%" }}>
        <Text.H3>{intl.string(t.REPLUGGED_QUICKCSS_EDITOR_POPPED_OUT)}</Text.H3>
      </Flex>
    </>
  ) : (
    <QuickCSSPanel />
  );
};
