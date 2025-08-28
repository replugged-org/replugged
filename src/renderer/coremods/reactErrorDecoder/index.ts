import REACT_ERROR_CODES from "./react.v19.0.0.codes.json";

/**
 * @internal
 * @hidden
 */
export const _decodeError = (code: keyof typeof REACT_ERROR_CODES, ...args: string[]): string =>
  `Code - ${code}; ${REACT_ERROR_CODES[code].replace(/%s/g, () => args.shift()!)}`;
