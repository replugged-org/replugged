export { mapModule } from "./mapper";

export { waitForModule } from "./lazy";

export { getComponentBySource, getFunctionBySource, getFunctionKeyBySource } from "./inner-search";

export { getById, getExportsForProps, getExportsKeyForProps, getModule } from "./get-modules";

/**
 * A collection of filter functions to be used with {@link getModule}.
 */
export * as filters from "./filters";

export * from "./helpers";

export { sourceStrings, wpRequire } from "./patch-load";

export { parseRegex, parseReplace } from "./plaintext-patch";
