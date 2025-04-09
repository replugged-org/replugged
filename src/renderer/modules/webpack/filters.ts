import type { RawModule } from "../../../types";
import { getExportsForProps } from "./get-modules";
import { sourceStrings } from "./patch-load";

/**
 * Get a module that has all the given properties on one of its exports
 * @param props List of property names
 */
export const byProps = <P extends PropertyKey = PropertyKey>(...props: P[]) => {
  return (m: RawModule) => typeof getExportsForProps(m.exports, props) !== "undefined";
};

/**
 * Get a module whose source code matches the given string or RegExp
 * @param match String or RegExp to match in the module's source code
 *
 * @remarks
 * This function matches on the minified code, so make sure to keep that in mind
 * when writing your strings/regex.
 * Randomized variable names (usually 1-2 letters) are not stable between Discord updates.
 * Make sure to use wildcards to make sure your RegExp matches if the variable name were to change.
 */
export const bySource = (match: string | RegExp) => {
  return (m: RawModule) => {
    const source = sourceStrings[m.id];
    if (!source) return false;

    return typeof match === "string" ? source.includes(match) : match.test(source);
  };
};

/**
 * Get a module that has the given value on one of its exports
 * @param match The string to check the value against
 *
 * @example
 * ```
 * const classes = getModule(filters.byValue("container-2sjPya"));
 * ```
 *
 * @remarks
 * Great for getting a module for a specific class name
 */
export const byValue = (match: string | RegExp) => {
  return (m: RawModule) => {
    if (!m.exports || typeof m.exports !== "object") {
      return false;
    }
    const matchIsString = typeof match === "string";
    for (const k in m.exports) {
      try {
        const v = (m.exports as Record<PropertyKey, unknown>)[k];
        if (matchIsString ? v === match : typeof v === "string" && match.test(v)) {
          return true;
        }
      } catch {}
    }
    return false;
  };
};
