export { waitForModule } from "./lazy";

export { getFunctionBySource, getFunctionKeyBySource } from "./inner-search";

export { getById, getExportsForProps, getModule } from "./get-modules";

/**
 * Filter functions to use with {@link getModule}
 */
export * as filters from "./filters";

export * from "./helpers";

export { sourceStrings, wpRequire } from "./patch-load";

export { parseRegex, parseReplace } from "./plaintext-patch";
