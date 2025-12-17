const UTC_CLASS_PREFIX = "utc_";

const ClassMap = new Map<string, string>();

const utcRegex = new RegExp(`${UTC_CLASS_PREFIX}\\S+\\s*`, "g");

const classNameRegex = /([\w\d_$]+?)-(\w+)/g;

const classPrefixHashRegex = /[_\d$]/;

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
    (suffix, [_, prefix, name]) =>
      classPrefixHashRegex.test(prefix) && !suffix.includes(name)
        ? `${suffix} utc_${name}`
        : suffix,
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
