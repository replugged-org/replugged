// https://github.com/uiwjs/react-codemirror/blob/master/themes/github/src/index.ts
// https://github.com/uiwjs/react-codemirror/blob/master/themes/theme/src/index.tsx

import { EditorView } from "codemirror";
import { type Extension } from "@codemirror/state";
import { HighlightStyle, type TagStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { type StyleSpec } from "style-mod";

export interface CreateThemeOptions {
  /**
   * Theme inheritance. Determines which styles CodeMirror will apply by default.
   */
  theme: Theme;
  /**
   * Settings to customize the look of the editor, like background, gutter, selection and others.
   */
  settings: Settings;
  /** Syntax highlighting styles. */
  styles: TagStyle[];
}

type Theme = "light" | "dark";

export interface Settings {
  /** Editor background. */
  background?: string;
  /** Default text color. */
  foreground?: string;
  /** Caret color. */
  caret?: string;
  /** Selection background. */
  selection?: string;
  /** Selection match background. */
  selectionMatch?: string;
  /** Background of highlighted lines. */
  lineHighlight?: string;
  /** Gutter background. */
  gutterBackground?: string;
  /** Text color inside gutter. */
  gutterForeground?: string;
  /** Text active color inside gutter. */
  gutterActiveForeground?: string;
  /** Gutter right border color. */
  gutterBorder?: string;
  /** set editor font */
  fontFamily?: string;
}

export const config = {
  name: "githubDark",
  dark: true,
  background: "#fff",
  foreground: "#24292e",
  selection: "#BBDFFF",
  selectionMatch: "#BBDFFF",
  gutterBackground: "#fff",
  gutterForeground: "#6e7781",
};

export const createTheme = ({
  theme,
  settings = {},
  styles = [],
}: CreateThemeOptions): Extension => {
  const themeOptions: Record<string, StyleSpec> = {
    ".cm-gutters": {},
  };
  const baseStyle: StyleSpec = {};
  if (settings.background) {
    baseStyle.backgroundColor = settings.background;
  }
  if (settings.foreground) {
    baseStyle.color = settings.foreground;
  }
  if (settings.background || settings.foreground) {
    themeOptions["&"] = baseStyle;
  }

  if (settings.fontFamily) {
    themeOptions["&.cm-editor .cm-scroller"] = {
      fontFamily: settings.fontFamily,
    };
  }
  if (settings.gutterBackground) {
    themeOptions[".cm-gutters"].backgroundColor = settings.gutterBackground;
  }
  if (settings.gutterForeground) {
    themeOptions[".cm-gutters"].color = settings.gutterForeground;
  }
  if (settings.gutterBorder) {
    themeOptions[".cm-gutters"].borderRightColor = settings.gutterBorder;
  }

  if (settings.caret) {
    themeOptions[".cm-content"] = {
      caretColor: settings.caret,
    };
    themeOptions[".cm-cursor, .cm-dropCursor"] = {
      borderLeftColor: settings.caret,
    };
  }
  let activeLineGutterStyle: StyleSpec = {};
  if (settings.gutterActiveForeground) {
    activeLineGutterStyle.color = settings.gutterActiveForeground;
  }
  if (settings.lineHighlight) {
    themeOptions[".cm-activeLine"] = {
      backgroundColor: settings.lineHighlight,
    };
    activeLineGutterStyle.backgroundColor = settings.lineHighlight;
  }
  themeOptions[".cm-activeLineGutter"] = activeLineGutterStyle;

  if (settings.selection) {
    themeOptions[
      "&.cm-focused .cm-selectionBackground, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection"
    ] = {
      backgroundColor: settings.selection,
    };
  }
  if (settings.selectionMatch) {
    themeOptions["& .cm-selectionMatch"] = {
      backgroundColor: settings.selectionMatch,
    };
  }
  const themeExtension = EditorView.theme(themeOptions, {
    dark: theme === "dark",
  });

  const highlightStyle = HighlightStyle.define(styles);
  const extension = [themeExtension, syntaxHighlighting(highlightStyle)];

  return extension;
};

export const githubLight = createTheme({
  theme: "light",
  settings: {
    background: "#fff",
    foreground: "#24292e",
    selection: "#BBDFFF",
    selectionMatch: "#BBDFFF",
    gutterBackground: "#fff",
    gutterForeground: "#6e7781",
  },
  styles: [
    { tag: [t.standard(t.tagName), t.tagName], color: "#116329" },
    { tag: [t.comment, t.bracket], color: "#6a737d" },
    { tag: [t.className, t.propertyName], color: "#6f42c1" },
    { tag: [t.variableName, t.attributeName, t.number, t.operator], color: "#005cc5" },
    { tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: "#d73a49" },
    { tag: [t.string, t.meta, t.regexp], color: "#032f62" },
    { tag: [t.name, t.quote], color: "#22863a" },
    { tag: [t.heading], color: "#24292e", fontWeight: "bold" },
    { tag: [t.emphasis], color: "#24292e", fontStyle: "italic" },
    { tag: [t.deleted], color: "#b31d28", backgroundColor: "#ffeef0" },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#e36209" },
    { tag: [t.url, t.escape, t.regexp, t.link], color: "#032f62" },
    { tag: t.link, textDecoration: "underline" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.invalid, color: "#cb2431" },
  ],
});

export const githubDark = createTheme({
  theme: "dark",
  settings: {
    background: "#0d1117",
    foreground: "#c9d1d9",
    caret: "#c9d1d9",
    selection: "#003d73",
    selectionMatch: "#003d73",
    lineHighlight: "#36334280",
  },
  styles: [
    { tag: [t.standard(t.tagName), t.tagName], color: "#7ee787" },
    { tag: [t.comment, t.bracket], color: "#8b949e" },
    { tag: [t.className, t.propertyName], color: "#d2a8ff" },
    { tag: [t.variableName, t.attributeName, t.number, t.operator], color: "#79c0ff" },
    { tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: "#ff7b72" },
    { tag: [t.string, t.meta, t.regexp], color: "#a5d6ff" },
    { tag: [t.name, t.quote], color: "#7ee787" },
    { tag: [t.heading], color: "#d2a8ff", fontWeight: "bold" },
    { tag: [t.emphasis], color: "#d2a8ff", fontStyle: "italic" },
    { tag: [t.deleted], color: "#ffdcd7", backgroundColor: "#ffeef0" },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#ffab70" },
    { tag: t.link, textDecoration: "underline" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.invalid, color: "#f97583" },
  ],
});
