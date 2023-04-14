import { React, toast } from "@common";
import { Messages } from "@common/i18n";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { css } from "@codemirror/lang-css";
import { githubDark, githubLight } from "./codemirror-github";
import { webpack } from "@replugged";
import { Button, Divider, Flex, Text } from "@components";
import "./QuickCSS.css";

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
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              setValue(update.state.doc.toString());
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
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

export const QuickCSS = (): React.ReactElement => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { value, setValue } = useCodeMirror({
    container: ref.current,
  });
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    void window.RepluggedNative.quickCSS.get().then((val) => {
      setValue(val);
      setReady(true);
    });
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    window.RepluggedNative.quickCSS.save(value);
  }, [value]);

  return (
    <>
      <Flex justify={Flex.Justify.BETWEEN} align={Flex.Align.START}>
        <Text.H2>{Messages.REPLUGGED_QUICKCSS}</Text.H2>
        <div style={{ display: "flex" }}>
          <Button
            onClick={() => {
              window.replugged.quickCSS.reload();
              toast.toast(Messages.REPLUGGED_TOAST_QUICKCSS_RELOAD);
            }}>
            {Messages.REPLUGGED_QUICKCSS_CHANGES_APPLY}
          </Button>
          <Button
            onClick={() => window.RepluggedNative.quickCSS.openFolder()}
            color={Button.Colors.PRIMARY}
            look={Button.Looks.LINK}>
            {Messages.REPLUGGED_QUICKCSS_FOLDER_OPEN}
          </Button>
        </div>
      </Flex>
      <Divider style={{ margin: "20px 0px" }} />
      <div ref={ref} id="replugged-quickcss-wrapper" />
    </>
  );
};
