export type ReactFiber<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  stateNode: Element | T;
  return: ReactFiber<T>;
};

export async function waitFor(selector: string): Promise<Element> {
  let element: Element | null = null;

  while (!element) {
    element = document.querySelector(selector);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return element;
}

export function getReactInstance<T extends Record<string, unknown> = Record<string, unknown>>(
  element: Element,
): ReactFiber<T> {
  const keys = Object.keys(element);
  const reactKey = keys.find((key) => key.startsWith("__reactFiber$"));
  if (!reactKey) {
    throw new Error("Could not find react fiber");
  }
  // @ts-expect-error Doesn't like the dynamic key I guess
  return element[reactKey];
}

export function getOwnerInstance<T extends Record<string, unknown> = Record<string, unknown>>(
  element: Element,
): T {
  let current = getReactInstance<T>(element);
  while (current) {
    const owner = current.stateNode;
    if (owner && !(owner instanceof Element)) {
      return owner;
    }
    current = current.return;
  }
  throw new Error("Could not find react owner");
}
