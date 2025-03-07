import getReact from "@common/react";
import getI18n from "@common/i18n";
import { plugins } from "@recelled";
import { t } from "../i18n";
import { Logger } from "../logger";

import "./ErrorBoundary.css";

const logger = new Logger("Components", "ErrorBoundary");

export interface ErrorProps {
  children: React.ReactNode;
  silent?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Element to show if the error boundary is triggered */
  fallback?: React.ReactNode;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  pluginName?: string;
}

export type ErrorBoundaryType = React.ComponentClass<ErrorProps, ErrorState>;

const getErrorBoundary = async (): Promise<ErrorBoundaryType> => {
  const React = await getReact;
  const { intl } = await getI18n;

  function CollapsibleErrorStack(props: { stack: string }): React.ReactElement {
    const { stack } = props;

    const [open, setOpen] = React.useState(false);

    const message = stack.split("\n")[0];

    return (
      <div className="recelled-error-boundary-collapsible">
        <div className="recelled-error-boundary-collapsible-header" onClick={() => setOpen(!open)}>
          <h3>{message}</h3>
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            style={{ transform: open ? "rotate(180deg)" : undefined, flex: "0 0 auto" }}>
            <path
              fill="var(--header-primary)"
              d="M16.59 8.59003L12 13.17L7.41 8.59003L6 10L12 16L18 10L16.59 8.59003Z"
            />
          </svg>
        </div>
        <div style={{ display: open ? "block" : "none" }}>
          <div className="recelled-error-boundary-collapsible-stack">
            <code>{stack}</code>
          </div>
        </div>
      </div>
    );
  }

  return class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
    public constructor(props: ErrorProps) {
      super(props);
      this.state = { hasError: false };
    }

    public static getDerivedStateFromError(error: Error): ErrorState {
      let pluginName;

      const pluginMatch = error?.stack?.match(/recelled:\/\/plugin\/([\w.]+)\//);
      if (pluginMatch) {
        const pluginId = pluginMatch[1];
        const plugin = plugins.plugins.get(pluginId);
        if (plugin) {
          pluginName = plugin.manifest.name;
        }
      }

      return { hasError: true, error, pluginName };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
      if (!this.props.silent) {
        logger.error("ErrorBoundary caught an error", error, errorInfo);
      }
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    }

    public render(): React.ReactNode {
      if (this.state.hasError) {
        const { error, pluginName } = this.state;

        return (
          this.props.fallback || (
            <div className="recelled-error-boundary">
              <h1>{intl.string(t.RECELLED_SETTINGS_ERROR_HEADER)}</h1>
              {pluginName && (
                <p className="recelled-error-boundary-plugin">
                  {intl.format(t.RECELLED_SETTINGS_ERROR_PLUGIN_NAME, { name: pluginName })}
                </p>
              )}
              <p>{intl.string(t.RECELLED_SETTINGS_ERROR_SUB_HEADER)}</p>
              {error?.stack && (
                <ErrorBoundary fallback={<></>}>
                  <CollapsibleErrorStack stack={error.stack} />
                </ErrorBoundary>
              )}
            </div>
          )
        );
      }

      return this.props.children;
    }
  };
};

export default getErrorBoundary();
