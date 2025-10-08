import { React, localStorage } from "@common";
import { Logger } from "@replugged";

interface LocalReactErrorCodes {
  version: string;
  errorCodes: Record<number, string>;
}

const logger = Logger.coremod("ReactErrorDecoder");

const REACT_ERROR_CODES_URL = `https://raw.githubusercontent.com/facebook/react/v${React.version}/scripts/error-codes/codes.json`;
const LOCAL_STORAGE_KEY = "replugged_reactErrorDecoder";

async function getReactErrorCodes(): Promise<Record<number, string> | undefined> {
  const cached = localStorage.get<LocalReactErrorCodes | undefined>(LOCAL_STORAGE_KEY);
  if (cached?.version === React.version) {
    return cached.errorCodes;
  }

  try {
    const res = await fetch(REACT_ERROR_CODES_URL);
    if (!res.ok) {
      logger.warn("Failed to fetch React error codes:", res);
      return;
    }

    const errorCodes: Record<number, string> = await res.json();

    localStorage.set(LOCAL_STORAGE_KEY, { version: React.version, errorCodes });

    return errorCodes;
  } catch (err) {
    logger.error("Error fetching React error codes:", err);
  }
}

const reactErrorCodes = await getReactErrorCodes();

/**
 * @internal
 * @hidden
 */
export const _decodeError = (code: number, ...args: string[]): string | undefined =>
  reactErrorCodes &&
  `React error #${code}; ${reactErrorCodes[code].replace(/%s/g, () => args.shift()!)}`;
