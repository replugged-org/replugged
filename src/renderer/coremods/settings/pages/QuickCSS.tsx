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

const { connectStores } = flux;

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
const PopoutWindowStore = webpack.getByStoreName("PopoutWindowStore") as Store & {
  getWindow: (key: string) => Window;
  getWindowOpen: (key: string) => boolean;
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
            <Tooltip text={Messages.SETTINGS}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={() => {}}>
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                />
              </svg>
            </Tooltip>

            <Tooltip text={props.popout ? Messages.CLOSE : Messages.POPOUT_PLAYER}>
              {!props.popout ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
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
                  }}>
                  <path
                    fill="currentColor"
                    d="M10 5V3H5.375C4.06519 3 3 4.06519 3 5.375V18.625C3 19.936 4.06519 21 5.375 21H18.625C19.936 21 21 19.936 21 18.625V14H19V19H5V5H10Z M21 2.99902H14V4.99902H17.586L9.29297 13.292L10.707 14.706L19 6.41302V9.99902H21V2.99902Z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 12 12"
                  onClick={() => {
                    closePopout("DISCORD_REPLUGGED_QUICKCSS");
                  }}>
                  <g fill="currentColor">
                    <path d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
                  </g>
                </svg>
              )}
            </Tooltip>
          </div>
          <div ref={ref}></div>
        </div>
      )}
    </>
  );
};

export const ConnectedQuickCSS = connectStores<{ popout: boolean }, { popout: boolean; isPopoutOpen: boolean }>([PopoutWindowStore], (props) => {
  return {
    isPopoutOpen: PopoutWindowStore.getWindowOpen("DISCORD_REPLUGGED_QUICKCSS"),
    ...props
  }
})(QuickCSS);
