import type { RawModule } from "src/types";
import type { Store } from "../common/flux";
import { getExportsForProps } from "./get-modules";
import { sourceStrings } from "./patch-load";
import { parseRegex } from "./plaintext-patch";

/**
 * Creates a filter function that checks if a module's exports contain the specified properties.
 * @template P The type of the property keys to check.
 * @param props The list of property keys to check for in the module's exports.
 * @returns A function for filtering modules based on the presence of the specified properties.
 * @example
 * ```ts
 * const MessageActionCreators = getModule(filters.byProps("sendMessage", "editMessage"));
 * ```
 */
export const byProps = <P extends PropertyKey = PropertyKey>(
  ...props: P[]
): ((m: RawModule) => boolean) => {
  return (m: RawModule) => typeof getExportsForProps(m.exports, props) !== "undefined";
};

/**
 * Creates a filter function that checks if a module's exports contain the specified prototype properties.
 * @template P The type of the property keys to check.
 * @param props The list of property keys to check for in the module's exports.
 * @returns A function for filtering modules based on the presence of the specified prototype properties.
 * @example
 * ```ts
 * const ChannelMessages = getModule(filters.byPrototype("jumpToMessage"));
 * ```
 */
export const byPrototype = <P extends PropertyKey = PropertyKey>(
  ...props: P[]
): ((m: RawModule) => boolean) => {
  return (m: RawModule) => typeof getExportsForProps(m.exports, props, true) !== "undefined";
};

/**
 * Creates a filter function that checks if a module's source code matches a given string or regular expression.
 *
 * A module source code is minified, so be aware that variable names may be obfuscated and can change between versions.
 * To create more robust regular expressions, consider using wildcards or patterns that can accommodate such changes.
 * The custom `\i` escape sequence can be used in the regular expression to match any valid identifier.
 * @param match A string or regular expression to match against the module's source code.
 * @returns A function for filtering modules based on their source code.
 * @example
 * ```ts
 * const constantsModule = getModule(filters.bySource("users/@me/relationships"));
 * ```
 */
export const bySource = (match: string | RegExp) => {
  return (m: RawModule) => {
    const source = sourceStrings[m.id];
    if (!source) return false;

    return typeof match === "string" ? source.includes(match) : parseRegex(match).test(source);
  };
};

/**
 * Creates a filter function that checks if a module's exported values match a given string or regular expression.
 * @param match A string or regular expression to match against the module's exported values.
 * @returns A function for filtering modules based on their exported values.
 * @example
 * ```ts
 * const classes = getModule(filters.byValue("container_c48ade"));
 * ```
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
        if (matchIsString ? v === match : typeof v === "string" && parseRegex(match).test(v)) {
          return true;
        }
      } catch {}
    }
    return false;
  };
};

/**
 * Creates a filter function to find a module by its store name.
 * @param name The name of the store to match.
 * @returns A function for filtering module by store name.
 * @example
 * ```ts
 * const UserStore = getModule(filters.byStoreName("UserStore"));
 * ```
 */
export const byStoreName = (name: string) => {
  return (m: RawModule) => {
    const storeExport = getExportsForProps<Store>(m.exports, ["getName", "_dispatchToken"]);
    if (storeExport && typeof storeExport.getName === "function") {
      try {
        return storeExport.getName() === name;
      } catch {
        return false;
      }
    }
    return false;
  };
};
