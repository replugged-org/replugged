const UTC_CLASS_PREFIX = "utc_";

const ClassMap = new Map<string, string>();

const utcRegex = new RegExp(`${UTC_CLASS_PREFIX}\\S+\\s*`, "g");

const classNameRegex = /(\w+?)_([\w\d_$]+)/g;

const classSuffixHashRegex = /[_\d$]/;

/**
 * @internal
 * @hidden
 */

function getClassName(input: string): string {
  const cached = ClassMap.get(input);
  if (cached) return cached;

  const baseClasses = input.includes(UTC_CLASS_PREFIX)
    ? input.replaceAll(utcRegex, "").trim()
    : input;

  const utcSuffixes = [...baseClasses.matchAll(classNameRegex)].reduce(
    (prefix, [_, name, suffix]) =>
      classSuffixHashRegex.test(suffix) && !prefix.includes(name)
        ? `${prefix} utc_${name}`
        : prefix,
    "",
  );

  const unified = `${baseClasses}${utcSuffixes}`;
  ClassMap.set(input, unified);
  return unified;
}

/**
 * @internal
 * @hidden
 */

export function _patchClassName(props: Record<string, string>, type: string): void {
  if (!props.className || type === "html") return;

  props.className = getClassName(props.className);
}
