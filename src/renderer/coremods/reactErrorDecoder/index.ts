import { React, localStorage } from "@common";
interface LocalReactErrorCodes {
  version: string;
  errorCodes: Record<number, string>;
}

const ReactErrorUrl = `https://raw.githubusercontent.com/facebook/react/v${React.version}/scripts/error-codes/codes.json`;

const LocalStorageKey = "replugged_reactErrorDecoder";

async function getReactErrorCodes(): Promise<Record<number, string> | void> {
  const cached = localStorage.get<LocalReactErrorCodes | undefined>(LocalStorageKey);
  if (cached?.version === React.version) {
    return cached.errorCodes;
  }

  const errorCodesRequest = await fetch(ReactErrorUrl);

  if (!errorCodesRequest.ok) return;

  const errorCodes: Record<number, string> = await errorCodesRequest.json();

  localStorage.set(LocalStorageKey, { version: React.version, errorCodes });

  return errorCodes;
}

const REACT_ERROR_CODES = await getReactErrorCodes();

/**
 * @internal
 * @hidden
 */
export const _decodeError = (code: number, ...args: string[]): string | void =>
  REACT_ERROR_CODES &&
  `Code - ${code}; ${REACT_ERROR_CODES[code].replace(/%s/g, () => args.shift()!)}`;
