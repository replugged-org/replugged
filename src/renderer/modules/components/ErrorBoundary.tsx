import { Messages } from "@common/i18n";
import React from "@common/react";
import { Logger } from "../logger";
import "./ErrorBoundary.css";

const logger = new Logger("Components", "ErrorBoundary");

export interface ErrorProps {
  children: React.ReactNode;
  silent?: boolean;
  onError?: (error: unknown, errorInfo: unknown) => void;
  /** Element to show if the error boundary is triggered */
  fallback?: React.ReactNode;
}

export interface ErrorState {
  hasError: boolean;
}

export type ErrorBoundaryType = React.ComponentClass<ErrorProps, ErrorState>;

export default class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
  public constructor(props: ErrorProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorState {
    return { hasError: true };
  }

  public componentDidCatch(error: unknown, errorInfo: unknown): void {
    if (!this.props.silent) {
      logger.error("ErrorBoundary caught an error", error, errorInfo);
    }
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="replugged-error-boundary">
            <h1>{Messages.REPLUGGED_SETTINGS_ERROR_HEADER}</h1>
            <p>{Messages.REPLUGGED_SETTINGS_ERROR_SUB_HEADER}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
