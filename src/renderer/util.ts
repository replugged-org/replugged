import { Fiber } from "react-reconciler";

/**
 * Loads a stylesheet into the document
 * @param path Path to the stylesheet
 * @returns Link element
 */
export const loadStyleSheet = (path: string): HTMLLinkElement => {
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = `${path}?t=${Date.now()}`;
  document.head.appendChild(el);

  return el;
};

/**
 * Wait for an element to be added to the DOM
 * @param selector Element selector
 */
export async function waitFor(selector: string): Promise<Element> {
  let element: Element | null = null;

  while (!element) {
    element = document.querySelector(selector);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return element;
}

/**
 * Get the React instance of an element
 * @param element Element to get the React instance of
 * @returns React instance
 * @throws If the React instance could not be found
 */
export function getReactInstance(element: Element): Fiber | null {
  const keys = Object.keys(element);
  const reactKey = keys.find((key) => key.startsWith("__reactFiber$"));
  if (!reactKey) {
    throw new Error("Could not find react fiber");
  }
  // @ts-expect-error Doesn't like the dynamic key I guess
  return element[reactKey];
}

/**
 * Get the React owner instance of an element
 * @param element Element to get the React owner instance of
 * @returns React owner instance
 * @throws If the React owner instance could not be found
 */
export function getOwnerInstance(element: Element): React.Component & Record<string, unknown> {
  let current = getReactInstance(element);
  while (current) {
    const owner = current.stateNode;
    if (owner && !(owner instanceof Element)) {
      return owner;
    }
    current = current.return;
  }
  throw new Error("Could not find react owner");
}

/**
 * Force updates a rendered React component by its DOM selector
 * @param selector The DOM selector to force update
 * @param all Whether all elements matching that selector should be force updated
 */
export function forceUpdateElement(selector: string, all = false): void {
  const elements = (
    all ? [...document.querySelectorAll(selector)] : [document.querySelector(selector)]
  ).filter(Boolean) as Element[];

  elements.forEach((element) => getOwnerInstance(element)?.forceUpdate());
}
