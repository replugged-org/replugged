import type { PlaintextPatch } from "src/types";

export default [
  {
    find: "this.triggerSoftCrash",
    replacements: [
      {
        match: /this._handleSubmitReport,children:\i\.intl\.string\(\i\.t\[".{5,8}"\]\)}\)/,
        replace: (prefix) =>
          `${prefix},replugged.coremods.coremods.softCrash?._renderCrashDetails({...this.state, resetError: () => this.setState({ error: null, info: null })})`,
      },
    ],
  },
] as PlaintextPatch[];
