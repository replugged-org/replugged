import { React, flux, toast } from "@common";
import { Messages } from "@common/i18n";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { css } from "@codemirror/lang-css";
import { githubDark, githubLight } from "./codemirror-github";
import { webpack } from "@replugged";
import { Button, ButtonItem, Divider, Flex, Text, Tooltip } from "@components";
import "./QuickCSS.css";
import { generalSettings } from "./General";
import { ReactComponent } from "src/types";
import { Store } from "@common/flux";
import Settings from "../icons/Settings";
import Popout from "../icons/Popout";
import Unpin from "../icons/Unpin";
import Pin from "../icons/Pin";

interface UseCodeMirrorOptions {
  value?: string;
  onChange?: (code: string) => unknown;
  container?: HTMLDivElement | null;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ThemeModule = {
  theme: "light" | "dark";
  addChangeListener: (listener: () => unknown) => unknown;
  removeChangeListener: (listener: () => unknown) => unknown;
};

const PopoutModule = await webpack.waitForModule(
  webpack.filters.bySource('type:"POPOUT_WINDOW_OPEN"'),
);
// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const openPopout = webpack.getFunctionBySource(PopoutModule, "POPOUT_WINDOW_OPEN") as (
  key: string,
  render: ReactComponent<unknown>,
  features: Record<string, string>,
) => void;
// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const closePopout = webpack.getFunctionBySource(PopoutModule, "POPOUT_WINDOW_CLOSE") as (
  key: string,
) => void;

// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const setAlwaysOnTop = webpack.getFunctionBySource(
  PopoutModule,
  "POPOUT_WINDOW_SET_ALWAYS_ON_TOP",
) as (key: string, alwaysOnTop: boolean) => void;

// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const PopoutWindowStore = webpack.getByStoreName("PopoutWindowStore") as Store & {
  getWindow: (key: string) => Window;
  getWindowOpen: (key: string) => boolean;
  getIsAlwaysOnTop: (key: string) => boolean;
};

// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const DnDProvider = webpack.getBySource(
  ".EMBEDDED_ACTIVITIES_ARE_YOU_SURE_WANT_TO_LEAVE",
) as ReactComponent<unknown>;

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
  // ESLint doesn't think x is a number, but it is
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const [update, forceUpdate] = React.useReducer((x) => x + 1, 0);

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
      newView?.destroy();
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

const QuickCSS = (props: { popout: boolean } & Record<string, boolean>): React.ReactElement => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { value, setValue } = useCodeMirror({
    container: ref.current,
  });
  const [ready, setReady] = React.useState(false);

  const autoApply = generalSettings.get("autoApplyQuickCss");

  const reload = (): void => window.replugged.quickCSS.reload();
  const reloadAndToast = (): void => {
    reload();
    toast.toast(Messages.REPLUGGED_TOAST_QUICKCSS_RELOAD);
  };

  React.useEffect(() => {
    void window.RepluggedNative.quickCSS.get().then((val) => {
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
    };

    window.addEventListener("keydown", listener);

    // This is the best way I could come up with to not show the sticker picker when CTRL + S is pressed
    // We want it to only be active when this tab is active
    const hideStickerPickerCss = `
    [class*="positionLayer-"] {
      display: none;
    }
    `;
    const style = document.createElement("style");
    style.innerText = hideStickerPickerCss;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("keydown", listener);
      document.head.removeChild(style);
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

  if (props.popout) {
    React.useEffect(() => {
      const window = PopoutWindowStore?.getWindow("DISCORD_REPLUGGED_QUICKCSS");

      let el = window.document.createElement("link");
      el.rel = "stylesheet";
      el.href = `replugged://renderer.css?t=${Date.now()}`;
      window.document.head.appendChild(el);
    }, []);
  }

  const [alwaysOnTop, setAlwaysOnTop_] = React.useState(props.popoutOnTop);

  return (
    <>
      {!props.popout ? (
        <>
          <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
            <Text.H2>{Messages.REPLUGGED_QUICKCSS}</Text.H2>
            <div style={{ display: "flex" }}>
              {autoApply ? null : (
                <Button onClick={reloadAndToast}>
                  {Messages.REPLUGGED_QUICKCSS_CHANGES_APPLY}
                </Button>
              )}
              <Button
                onClick={() => window.RepluggedNative.quickCSS.openFolder()}
                color={Button.Colors.PRIMARY}
                look={Button.Looks.LINK}>
                {Messages.REPLUGGED_QUICKCSS_FOLDER_OPEN}
              </Button>
            </div>
          </Flex>
          <Divider style={{ margin: "20px 0px" }} />
        </>
      ) : null}

      {!props.popout && props.isPopoutOpen ? (
        <ButtonItem
          button="Close Popout"
          onClick={() => {
            closePopout("DISCORD_REPLUGGED_QUICKCSS");
          }}>
          {Messages.REPLUGGED_QUICKCSS_POPPED_OUT}
        </ButtonItem>
      ) : (
        <div id="replugged-quickcss-wrapper" data-popout={props.popout}>
          <div className="replugged-quickcss-header">
            {props.popout ? (
              <Tooltip
                text={alwaysOnTop ? Messages.POPOUT_REMOVE_FROM_TOP : Messages.POPOUT_STAY_ON_TOP}>
                {alwaysOnTop ? (
                  <Unpin
                    onClick={() => {
                      setAlwaysOnTop("DISCORD_REPLUGGED_QUICKCSS", false);
                      setAlwaysOnTop_(false);
                    }}
                  />
                ) : (
                  <Pin
                    onClick={() => {
                      setAlwaysOnTop("DISCORD_REPLUGGED_QUICKCSS", true);
                      setAlwaysOnTop_(true);
                    }}
                  />
                )}
              </Tooltip>
            ) : (
              <Tooltip text={Messages.POPOUT_PLAYER}>
                <Popout
                  onClick={() => {
                    openPopout(
                      "DISCORD_REPLUGGED_QUICKCSS",
                      () => (
                        <DnDProvider windowKey="DISCORD_REPLUGGED_QUICKCSS">
                          <QuickCSS popout={true}></QuickCSS>
                        </DnDProvider>
                      ),
                      {},
                    );
                  }}
                />
              </Tooltip>
            )}
          </div>
          <div ref={ref}></div>
        </div>
      )}
    </>
  );
};

export const ConnectedQuickCSS = flux.connectStores<
  { popout: boolean },
  { popout: boolean; isPopoutOpen: boolean }
>([PopoutWindowStore], (props) => {
  return {
    isPopoutOpen: PopoutWindowStore.getWindowOpen("DISCORD_REPLUGGED_QUICKCSS"),
    popoutOnTop: PopoutWindowStore.getIsAlwaysOnTop("DISCORD_REPLUGGED_QUICKCSS"),
    ...props,
  };
})(QuickCSS);
