import { Messages } from "@common/i18n";
import React from "@common/react";
import { Logger } from "../logger";
import "./ErrorBoundary.css";

const logger = new Logger("Components", "ErrorBoundary");

export interface ErrorProps {
  children: React.ReactElement | React.ReactElement[];
  silent?: boolean;
  onError?: (error: unknown, errorInfo: unknown) => void;
  /** Element to show if the error boundary is triggered */
  fallback?: React.ReactElement | React.ReactElement[];
}

export interface ErrorState {
  hasError: boolean;
}

export type ErrorBoundaryType = React.ComponentClass<ErrorProps, ErrorState>;

export default class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
  constructor(props: ErrorProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    if (!this.props.silent) {
      logger.error("ErrorBoundary caught an error", error, errorInfo);
    }
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
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
