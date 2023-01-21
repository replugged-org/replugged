import { React, ready } from "@common";
import { Flex, Text } from "@components";
import { Logger } from "../logger";

const logger = new Logger("Components", "ErrorBoundary");

export interface ErrorProps {
  children: React.ReactElement | React.ReactElement[];
  silent?: boolean;
  onError?: (error: unknown, errorInfo: unknown) => void;
  errorElement?: React.ReactElement | React.ReactElement[];
}

export interface ErrorState {
  hasError: boolean;
}

export type ErrorBoundaryType = React.ComponentClass<ErrorProps, ErrorState>;

await ready;

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
      if (this.props.errorElement) return this.props.errorElement;
      return (
        <Flex direction={Flex.Direction.VERTICAL} align={Flex.Align.CENTER}>
          <Text.H1 style={{ marginBottom: "10px" }}>
            Something went wrong rendering this element!
          </Text.H1>
          <Text.H3>Check console for details.</Text.H3>
        </Flex>
      );
    }

    return this.props.children;
  }
}
