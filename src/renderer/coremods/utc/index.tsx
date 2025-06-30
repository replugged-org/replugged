type RegExpReducible<T> = RegExpStringIterator<T> & { reduce: T[]["reduce"] };
const classMap = new Map<string, string>();

/**
 * @internal
 * @hidden
 */

export function _getClassName(input: string): string {
  if (classMap.has(input)) return classMap.get(input)!;

  const baseClasses = input.includes("utc_") ? input.replaceAll(/utc_\S+\s*/g, "").trim() : input;

  const suffixMatch = baseClasses.matchAll(/(\w+?)_/g) as RegExpReducible<RegExpExecArray>;

  const suffix = suffixMatch.reduce((suffix, [_, name]) => `${suffix}_${name}`, "");

  const unified = suffix.length ? `${baseClasses} utc${suffix}` : baseClasses;

  classMap.set(input, unified);

  return unified;
}
