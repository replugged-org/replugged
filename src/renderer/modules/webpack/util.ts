import { Logger } from "../logger";

const logger = Logger.api("webpack");

/**
 * Log caught errors from webpack query, while doing some filtering to reduce noise
 * @param opts Object containing the properties below. Any other properties provided will be logged as metadata.
 * @param opts.text Text to be logged with the error
 * @param opts.err Error object is expected, but can be anything
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
