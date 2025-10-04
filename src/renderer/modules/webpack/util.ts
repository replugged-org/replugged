import { Logger } from "../logger";

const logger = Logger.api("webpack");

/**
 * Logs an error message along with optional metadata. Certain expected errors are ignored to reduce noise in the logs.
 * @param opts Configuration object containing the error details and metadata.
 * @param opts.text The main error message to log.
 * @param opts.err An optional error object. If provided, it will be checked for specific known error types to determine if it should be ignored.
 * @internal
 */
export function logError({
  text,
  err,
  ...logMetadata
}: {
  text: string;
  err?: unknown;
} & Record<string, unknown>): void {
  const isError = err instanceof Error;
  if (isError) {
    // Reduce noise by ignoring expected errors

    // Blocked frame error - see #370
    if (
      err.name === "SecurityError" &&
      /^Blocked a frame with origin ".+" from accessing a cross-origin frame\.$/.test(err.message)
    ) {
      return;
    }

    // Illegal invocation. Caused by interacting with some native classes/objects, e.g. DOMTokenList
    if (err.name === "TypeError" && /^Illegal invocation$/.test(err.message)) {
      return;
    }
  }

  logger.error(text, {
    err,
    ...logMetadata,
  });
}
